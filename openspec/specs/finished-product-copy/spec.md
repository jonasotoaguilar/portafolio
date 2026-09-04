# Finished Product Copy Specification

## Purpose

Shipped UI copy reads as a finished product. CV and GitHub remain internal inputs. Public text does not teach provenance, development state, or verification method.

## Requirements

### Requirement: Public Voice Is Finished Product

Visible UI copy MUST describe the product and the owner’s work. It MUST NOT reference development state, implementation details, forms, providers, storage, backend absence, privacy-policy internals, or “view source”.

#### Scenario: Contact copy is product language

- GIVEN `/contact` is rendered
- WHEN visible copy is read
- THEN it presents contact channels as a finished product
- AND it does not mention forms, providers, storage, backend absence, or viewing source

#### Scenario: About and Experience copy is product language

- GIVEN `/about` and `/experience` are rendered
- WHEN visible copy is read
- THEN it states facts about the owner and work
- AND it does not describe how those facts were verified

### Requirement: No Public Proof or Verification Voice

Shipped UI copy MUST NOT cite CV or GitHub as proof, verification, or source-of-truth. The substring `CV` MUST NOT appear in public DOM or built HTML. GitHub MAY appear as a contact or project channel, not as evidence.

#### Scenario: Dist contains no public CV

- GIVEN a production build
- WHEN public HTML is scanned
- THEN no `CV` string is present in user-visible copy or markup text

#### Scenario: GitHub is a channel, not proof

- GIVEN pages that mention GitHub
- WHEN visible copy is read
- THEN GitHub is a destination or project link
- AND copy does not claim GitHub verifies, proves, or authorizes the page

### Requirement: No Provenance Teaching Copy

Public copy MUST NOT explain omitted phone, text-only LinkedIn, unconfirmed URLs, or privacy-by-omission. Those constraints remain true; they MUST NOT be narrated in the UI.

#### Scenario: Contact does not narrate privacy mechanics

- GIVEN `/contact` is rendered
- WHEN visible copy is read
- THEN it does not mention phone omission, JSON-LD, DOM scanning, or privacy internals

#### Scenario: ClientRouter does not restore old provenance copy

- GIVEN ClientRouter navigation or back-forward across public routes
- WHEN visible copy is read
- THEN no provenance, development, or source-verification phrasing is present
