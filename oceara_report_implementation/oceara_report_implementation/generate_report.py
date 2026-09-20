#!/usr/bin/env python3
"""Generate a Form-3 progress PDF from Git history.

Usage: python generate_report.py weekly|monthly|final
"""
from __future__ import annotations
import datetime as dt
import html
import io
import subprocess
import sys
from collections import defaultdict
from pathlib import Path
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, KeepTogether

COLLEGE = "Swami Keshvanand Institute of Technology, Management & Gramothan, Jaipur"
DEPARTMENT = "Department of Computer Science & Engineering"


def git(*args: str) -> str:
    return subprocess.check_output(["git", *args], text=True, errors="replace").strip()


def repo_info():
    try:
        repo = Path(git("rev-parse", "--show-toplevel")).name
    except Exception:
        repo = Path.cwd().name
    try:
        branch = git("branch", "--show-current") or "detached-HEAD"
    except Exception:
        branch = "unknown"
    return repo, branch


def get_scope(interval: str):
    today = dt.date.today()
    if interval == "weekly":
        since = today - dt.timedelta(days=7)
        return f"Last 7 days (since {since})", since.isoformat()
    if interval == "monthly":
        since = today - dt.timedelta(days=30)
        return f"Last 30 days (since {since})", since.isoformat()
    if interval == "final":
        return "Complete project lifecycle (all commits)", None
    raise ValueError("Use weekly, monthly, or final")


def collect(interval: str):
    scope, since = get_scope(interval)
    args = ["log", "--no-merges", "--date=short", "--pretty=format:COMMIT|||%h|||%an|||%ad|||%s", "--numstat"]
    if since:
        args.append(f"--since={since}")
    output = git(*args)
    people = defaultdict(lambda: {"commits": 0, "added": 0, "deleted": 0, "days": set()})
    timeline = defaultdict(lambda: defaultdict(int))
    logs = defaultdict(list)
    author = None
    for raw in output.splitlines():
        line = raw.strip()
        if not line:
            continue
        if line.startswith("COMMIT|||"):
            parts = line.split("|||", 4)
            if len(parts) != 5:
                author = None
                continue
            _, sha, author_name, date_text, subject = parts
            if "bot" in author_name.lower() or "github-actions" in author_name.lower():
                author = None
                continue
            author = author_name.strip()
            people[author]["commits"] += 1
            people[author]["days"].add(date_text.strip())
            logs[author].append((date_text.strip(), sha.strip(), subject.strip()))
            try:
                date = dt.date.fromisoformat(date_text.strip())
                key = date.strftime("%a %d %b") if interval == "weekly" else date.strftime("%d %b") if interval == "monthly" else date.strftime("%Y-%m")
                timeline[key][author] += 1
            except ValueError:
                pass
        elif author:
            fields = line.split()
            if len(fields) >= 2 and fields[0].isdigit() and fields[1].isdigit():
                people[author]["added"] += int(fields[0])
                people[author]["deleted"] += int(fields[1])
    return people, timeline, logs, scope


def chart(people, timeline, interval):
    fig, axes = plt.subplots(1, 2, figsize=(10.5, 3.1))
    names, periods = list(people), list(timeline)
    if names and periods:
        for name in names:
            axes[0].plot(periods, [timeline[p].get(name, 0) for p in periods], marker="o", label=name)
        axes[0].set_title(f"Commit activity ({interval})")
        axes[0].set_ylabel("Commits")
        axes[0].tick_params(axis="x", rotation=35, labelsize=7)
        axes[0].legend(fontsize=7)
        axes[0].grid(axis="y", linestyle="--", alpha=.4)
    else:
        axes[0].text(.5, .5, "No commits in this period", ha="center", va="center")
        axes[0].set_axis_off()
    if names:
        axes[1].bar(names, [people[n]["added"] - people[n]["deleted"] for n in names])
        axes[1].set_title("Net lines changed")
        axes[1].tick_params(axis="x", rotation=35, labelsize=7)
        axes[1].grid(axis="y", linestyle="--", alpha=.4)
    else:
        axes[1].text(.5, .5, "No line changes recorded", ha="center", va="center")
        axes[1].set_axis_off()
    fig.tight_layout()
    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=180, bbox_inches="tight")
    plt.close(fig)
    buf.seek(0)
    return Image(buf, width=7 * inch, height=2.15 * inch)


def p(text, style):
    return Paragraph(html.escape(str(text)), style)


def generate(interval="weekly"):
    people, timeline, logs, scope = collect(interval)
    repo, branch = repo_info()
    stamp = dt.date.today().isoformat()
    title = {"weekly": "Weekly Progress Report (Form-3)", "monthly": "Monthly Progress Report (Form-3)", "final": "Final Project Evaluation Report"}[interval]
    suffix = {"weekly": "Weekly_Progress_Report_Form-3", "monthly": "Monthly_Progress_Report_Form-3", "final": "Final_Report"}[interval]
    path = Path.cwd() / f"{repo}_{suffix}_{stamp}.pdf"
    doc = SimpleDocTemplate(str(path), pagesize=letter, leftMargin=30, rightMargin=30, topMargin=28, bottomMargin=28)
    styles = getSampleStyleSheet()
    heading = ParagraphStyle("heading", parent=styles["Heading1"], alignment=1, fontSize=13, leading=16)
    center = ParagraphStyle("center", parent=styles["Normal"], alignment=1, fontSize=9, leading=12)
    section = ParagraphStyle("section", parent=styles["Heading2"], fontSize=11, leading=14, spaceBefore=7)
    cell = ParagraphStyle("cell", parent=styles["Normal"], fontSize=7.5, leading=9)
    small = ParagraphStyle("small", parent=styles["Normal"], fontSize=8, leading=10)
    signature = ParagraphStyle("signature", parent=styles["Normal"], fontSize=9, leading=14)
    story = [Paragraph(f"<b>{html.escape(COLLEGE)}</b>", heading), Paragraph(f"<b>{html.escape(DEPARTMENT)}</b>", center), Spacer(1, 4), Paragraph(f"<u><b>{title}</b></u>", center), Spacer(1, 8), p(f"Repository: {repo} | Branch: {branch}", small), p(f"Evaluation window: {scope} | Generated on: {stamp}", small), Paragraph("1. Individual Contribution Breakdown", section)]
    total = sum(v["commits"] for v in people.values())
    rows = [["Contributor", "Commits (%)", "Added", "Deleted", "Net", "Active days"]]
    for name in sorted(people):
        v = people[name]
        pct = v["commits"] / total * 100 if total else 0
        rows.append([p(name, cell), p(f"{v['commits']} ({pct:.1f}%)", cell), p(f"+{v['added']:,}", cell), p(f"-{v['deleted']:,}", cell), p(f"{v['added']-v['deleted']:,}", cell), p(f"{len(v['days'])}", cell)])
    if not people:
        rows.append([p("No commits found in this period.", cell), "-", "-", "-", "-", "-"])
    table = Table(rows, colWidths=[145, 75, 65, 65, 60, 75], repeatRows=1)
    table.setStyle(TableStyle([("BACKGROUND", (0,0), (-1,0), colors.HexColor("#1E293B")), ("TEXTCOLOR", (0,0), (-1,0), colors.white), ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"), ("FONTSIZE", (0,0), (-1,-1), 8), ("GRID", (0,0), (-1,-1), .4, colors.HexColor("#CBD5E1")), ("ALIGN", (1,0), (-1,-1), "CENTER"), ("VALIGN", (0,0), (-1,-1), "MIDDLE")]))
    story += [table, Spacer(1, 8), Paragraph("2. Visual Trends & Volume", section), chart(people, timeline, interval), Spacer(1, 8), Paragraph("3. Detailed Commit Logs & Mentor Evaluation", section)]
    for name in sorted(logs):
        log_rows = [["Date", "SHA", "Commit message", "Mentor marks (/10)"]]
        for i, (date, sha, subject) in enumerate(logs[name]):
            log_rows.append([p(date, cell), p(sha, cell), p(subject or "(no message)", cell), p("_____ / 10" if i == 0 else "", cell)])
        lt = Table(log_rows, colWidths=[62, 48, 310, 80], repeatRows=1)
        lt.setStyle(TableStyle([("BACKGROUND", (0,0), (-1,0), colors.HexColor("#475569")), ("TEXTCOLOR", (0,0), (-1,0), colors.white), ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"), ("FONTSIZE", (0,0), (-1,-1), 7.5), ("GRID", (0,0), (-1,-1), .4, colors.HexColor("#CBD5E1")), ("SPAN", (3,1), (3,len(log_rows)-1)), ("BACKGROUND", (3,1), (3,len(log_rows)-1), colors.HexColor("#FEF3C7")), ("VALIGN", (0,0), (-1,-1), "MIDDLE")]))
        story.append(KeepTogether([p(f"{name} — {len(logs[name])} commit(s)", small), lt, Spacer(1, 6)]))
    story += [Spacer(1, 14), Table([[Paragraph("<b>Name:</b> ___________________________<br/><b>Designation:</b> Project Mentor<br/><br/><b>Signature:</b> ________________________", signature), Paragraph("<b>Name:</b> ___________________________<br/><b>Designation:</b> Lab Coordinator<br/><br/><b>Signature:</b> ________________________", signature)]], colWidths=[270,270], style=TableStyle([("VALIGN", (0,0), (-1,-1), "TOP"), ("LEFTPADDING", (0,0), (-1,-1), 0), ("RIGHTPADDING", (0,0), (-1,-1), 0)]))]
    doc.build(story)
    print(f"Generated: {path.name}")
    print(f"Contributors: {len(people)} | Commits: {total}")


if __name__ == "__main__":
    generate(sys.argv[1].lower() if len(sys.argv) > 1 else "weekly")
