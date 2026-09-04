# Public Contact Channels Specification

## Purpose

Public contact identity: About advances to Contact, LinkedIn is the authorized profile URL wherever the handle appears, and the phone number is omitted from all public outputs.

## Requirements

### Requirement: About CTA Advances to Contact

The About page MUST expose a primary next-action control that navigates to `/contact`. That control MUST NOT navigate to `/experience`.

#### Scenario: About CTA opens Contact

- GIVEN the visitor is on `/about`
- WHEN they activate the primary next-action control
- THEN the next location is `/contact`

#### Scenario: CTA survives ClientRouter navigation

- GIVEN the visitor reached `/about` via ClientRouter (including back or forward)
- WHEN they activate the primary next-action control
- THEN the next location is `/contact`

### Requirement: Authorized LinkedIn URL Is Clickable

Wherever the LinkedIn handle is shown, the system MUST render a link whose `href` is exactly `https://www.linkedin.com/in/jonathan-soto-dev`. The system MUST NOT emit any other `linkedin.com` URL. The link MUST use `rel` containing `me`, `noopener`, and `noreferrer`.

#### Scenario: Contact, home, and Footer use the exact URL

- GIVEN `/contact`, `/`, and any page that shows Footer
- WHEN those surfaces are rendered
- THEN each visible LinkedIn handle is an anchor to `https://www.linkedin.com/in/jonathan-soto-dev`
- AND no other `linkedin.com` href exists

#### Scenario: JSON-LD sameAs includes the exact URL

- GIVEN a built public page with Person JSON-LD
- WHEN `sameAs` is read
- THEN it includes `https://www.linkedin.com/in/jonathan-soto-dev`

#### Scenario: Handle remains a link after ClientRouter

- GIVEN ClientRouter navigation or back-forward among `/`, `/about`, and `/contact`
- WHEN LinkedIn is shown
- THEN the href is still exactly `https://www.linkedin.com/in/jonathan-soto-dev`

### Requirement: Phone Number Omitted

The phone number MUST NOT appear in the DOM, built HTML, metadata, JSON-LD, or other public artifacts. Public output MUST NOT contain `tel:`, a `telephone` property, or the digits `8894`, `2050`, or `+56` as a phone token.

#### Scenario: No-phone scan of public outputs

- GIVEN a production build of all public routes
- WHEN DOM, HTML, metadata, JSON-LD, and public artifacts are scanned
- THEN no phone number, `tel:`, or `telephone` property is present

#### Scenario: Contact after ClientRouter still omits phone

- GIVEN the visitor reached `/contact` via ClientRouter
- WHEN the document is scanned
- THEN no phone token is present
