# Oceara MRV UI and Component Guide

## 1. Purpose

This document describes the frontend structure and user-interface considerations of the Oceara MRV platform.

The goal is to improve consistency and make future frontend development easier.

---

## 2. Main Interface Areas

The current frontend contains the following major interface areas:

- Landing page
- How It Works
- Projects
- Reports
- Contact / Request Pilot

The interface presents different parts of the Oceara MRV platform through navigation links and dedicated sections.

---

## 3. Common UI Elements

The frontend uses several reusable interface elements, including:

- Navigation bar
- Buttons
- Cards
- Forms
- Project information sections
- Map / globe visualizations
- Status indicators
- Information sections
- Calls to action

Reusable components should be preferred wherever the same interface pattern appears more than once.

---

## 4. Design Considerations

The frontend should maintain consistency in:

- Typography
- Spacing
- Button styles
- Form layouts
- Border radius
- Icon usage
- Color usage
- Component behavior
- Error handling
- Loading states

The current interface uses a dark visual theme with blue and cyan accents and large visual elements on the landing page.

---

## 5. Accessibility Considerations

The following practices should be maintained:

- Buttons should have clear labels.
- Form fields should have associated labels.
- Text should have sufficient contrast.
- Images should have alternative text where required.
- Keyboard navigation should be considered.
- Error messages should be understandable.
- Interactive elements should be easy to identify.

---

## 6. Responsive Design

The interface should be tested on:

- Desktop screens
- Laptop screens
- Tablets
- Mobile devices

The following issues should be checked:

- Horizontal scrolling
- Overlapping elements
- Text overflow
- Small buttons
- Inaccessible navigation
- Improperly sized maps or charts

---

## 7. UI/UX Observations

| Area | Observation | Suggested Improvement | Priority |
|---|---|---|---|
| Navigation | The main navigation provides access to Home, How It Works, Projects, Reports, and Contact / Request Pilot. | Keep navigation labels consistent and descriptive. | Medium |
| Home | The landing page prominently presents two user-role paths: Project Owner and Institution / Program. | Add a short instruction explaining why users should choose between the two paths. | Medium |
| Projects | Project information is presented through project cards and map-based visualization. | Maintain clear hierarchy between project status, project information, and primary actions. | Medium |
| Reports | Reports provides access to MRV-related information and project registry actions. | Keep primary report and registry actions visually distinct. | Medium |
| Contact / Request Pilot | The page provides a form for users to submit a request. | Keep field labels and form grouping clear. | Medium |

---

## 8. Suggested Future Improvements

Possible improvements include:

1. Standardizing reusable buttons and cards.
2. Improving mobile responsiveness.
3. Adding consistent loading states.
4. Improving form validation messages.
5. Improving keyboard accessibility.
6. Creating a shared component library.
7. Improving dashboard and information hierarchy.

---

## 9. Review Status

This document is intended as a frontend reference document.

The observations above are based on a review of the currently running Oceara MRV frontend.

Further UI/UX observations can be added as additional pages and responsive states are reviewed.

---

## 10. Actual Review Observation

- Page reviewed: Home
- Observation: The landing page prominently presents Project Owner and Institution / Program as two user-role paths.
- Suggested improvement: Add a short instruction explaining the purpose of the choice so users immediately understand why they are selecting between the two paths.
- Priority: Medium