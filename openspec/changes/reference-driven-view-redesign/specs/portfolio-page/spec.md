# Delta for portfolio-page

## MODIFIED Requirements

### Requirement: LIST/detail views

PROJECTS and SKILLS MUST render a LIST of items and an in-view detail panel for the selected item. RESUME MUST NOT render as LIST/detail: it renders as a single editorial composition without tabs, buttons, or selectors. A PROJECTS fragment link (`/projects#serviceflow`) MUST preselect the matching project. Below 768px, the detail panel MUST stack below the LIST and scroll internally when content overflows. Opening a panel MUST move focus into it; closing MUST return focus to the list item. LIST interactive elements MUST be at least 44px tall.
(Previously: RESUME also rendered as a LIST/detail view with tabs)

#### Scenario: Projects list with deep link

- GIVEN the PROJECTS view requested at `/projects#serviceflow`
- WHEN the view renders
- THEN the four project items render and the ServiceFlow detail is preselected

#### Scenario: Mobile stacked panel scrolls

- GIVEN a viewport below 768px
- WHEN a PROJECTS or SKILLS detail panel opens
- THEN the panel renders below the LIST and scrolls internally when content overflows

#### Scenario: Focus moves with the panel

- GIVEN a LIST with the detail panel closed
- WHEN Enter opens the panel and Escape closes it
- THEN focus moves into the panel on open and returns to the list item on close

#### Scenario: Resume is editorial with no tabs

- GIVEN the RESUME view rendered
- WHEN its controls are inspected
- THEN the view renders as one scrollable editorial composition with no tab or selector controls

### Requirement: First-load JavaScript budget

Every route MUST ship less than 100KB of gzipped JavaScript on first load, including canvas, motion, section-navigation, and all inline scripts.
(Previously: the 100KB budget did not account for inline scripts)

#### Scenario: Budget enforced on every route

- GIVEN the production build output
- WHEN the gzipped JavaScript bytes are measured per route, including inline scripts
- THEN each route's total is below 100KB

## ADDED Requirements

### Requirement: Route composition contracts

The six routes MUST render the reference-driven compositions over the deep-ocean base with white contrast cuts: `/` — left white contrast field, partially cropped vertical PORTFOLIO word, stat card, menu central/right; `/about` — centered diagonal white stats panel plus a tall right diagonal portrait/name composition from original vector geometry; `/projects` — left diagonal inset menu with right diagonal detail panel; `/skills` — left straight category list with right selected skill list; `/contact` — left social-links menu with right character/abstract art composition; `/resume` — single editorial composition (upper-left panel, text, list, lower-left panel) without tabs. Two-pane compositions MUST stack below 768px preserving document reading order. Without JavaScript, every route MUST render all content in normal document flow. Clip-path geometry MUST NOT clip text or controls at any viewport. Text MUST meet WCAG 2.2 AA contrast on both the dark base and white/light surfaces, and coarse-pointer targets MUST remain at least 44px with no overlap.

#### Scenario: Home composition renders

- GIVEN the root route rendered
- WHEN the page is inspected
- THEN the white contrast field, the cropped vertical PORTFOLIO word, the stat card, and the central/right menu are present

#### Scenario: About composition renders

- GIVEN the ABOUT route rendered
- WHEN the page is inspected
- THEN a centered diagonal stats panel and a tall right portrait/name composition render

#### Scenario: Projects and Skills two-pane compositions render

- GIVEN the PROJECTS and SKILLS routes rendered
- WHEN each page is inspected
- THEN PROJECTS shows a left diagonal menu with a right detail panel and SKILLS shows a left category list with a right selected list

#### Scenario: Contact composition renders

- GIVEN the CONTACT route rendered
- WHEN the page is inspected
- THEN a left social-links menu and a right abstract art composition render

#### Scenario: Zero-JS reading order

- GIVEN JavaScript disabled
- WHEN any route renders
- THEN all content appears in normal document flow in reading order and two-pane routes stack their panes

#### Scenario: Responsive stacking below 768px

- GIVEN a viewport below 768px
- WHEN a two-pane composition renders
- THEN the panes stack vertically, content is not clipped, and no horizontal scroll appears

#### Scenario: Clip-path never clips content

- GIVEN viewports at 768px and above
- WHEN diagonal panels render
- THEN every text node and control is fully visible within its panel bounds

#### Scenario: AA contrast on light surfaces

- GIVEN a white/light panel with text
- WHEN contrast is measured
- THEN text meets WCAG 2.2 AA against the light surface and the dark base

### Requirement: Principal persona asset placement

Each of the six routes MUST render exactly one principal image from `assets/persona`. `persona_1` and `persona_2` MUST be the only images used as full-body principals; `persona_3`, `persona_4`, and `persona_5` MUST be used only in support/profile roles and MUST NOT serve as principal images; `persona_6` through `persona_11` MAY be used as menu or page composition candidates; when multiple candidates fit a route, the favorites `persona_1`, `persona_8`, and `persona_11` MUST be preferred wherever they fit.

#### Scenario: One principal per route

- GIVEN any route rendered
- WHEN principal persona images are counted
- THEN exactly one principal `assets/persona` image renders on that route

#### Scenario: Support images never principal

- GIVEN a route that uses `persona_3`, `persona_4`, or `persona_5`
- WHEN the image roles are inspected
- THEN those images appear only in support/profile roles, never as the route principal

#### Scenario: Favorites preferred

- GIVEN a route where `persona_1`, `persona_8`, or `persona_11` fits
- WHEN the principal image is selected
- THEN one of the favorites is used over other candidates

### Requirement: Decorative sprite restraint

`assets/sprites` images MAY repeat across a route as restrained background patterns, watermarks, or accents. Repeated sprites MUST NOT obscure text or controls and MUST NOT reduce adjacent content below WCAG 2.2 AA contrast. Interactive elements MUST remain reachable and readable wherever sprites appear. The former `assets/icon` directory MUST NOT be reintroduced as an alias, symlink, fallback, or duplicate; every reference uses `assets/sprites`.

#### Scenario: Sprites never obscure content

- GIVEN a route with repeated `assets/sprites` accents
- WHEN text and controls over the accents are inspected
- THEN they remain fully readable, meet AA contrast, and receive pointer and keyboard input without interference

### Requirement: Reference mockups and sheets are input-only

The mockup references `docs/assets/mockup/mockup_1..6.png`, the asset sheets under `docs/assets/asset_sheet`, and any `docs/assets/example` references MUST be used only as design input: they MUST NOT be copied, referenced, or shipped as production assets, and production output MUST NOT contain them.

#### Scenario: Mockups and sheets excluded from output

- GIVEN the production build output
- WHEN it is scanned for mockup, sheet, or example reference files
- THEN no reference file from `docs/assets/mockup`, `docs/assets/asset_sheet`, or `docs/assets/example` appears in the output

### Requirement: Principal image delivery and payload

Production pages MUST load persona and sprite images only as optimized responsive derivatives (format and width variants sized for the render slot) and MUST NOT request the original full-size PNGs during page load. Original source PNGs under `assets/persona` and `assets/sprites` MUST remain untouched.

#### Scenario: Derivatives served, originals not requested

- GIVEN the production site
- WHEN a route's network requests are captured
- THEN only derivative image files load and no original `assets/persona` or `assets/sprites` PNG is requested

### Requirement: Music source and derivative shipping

The raw source `assets/music/background.mp3` MUST NOT ship as a downloadable file: production output MUST NOT contain the raw or source MP3 and MUST NOT expose any direct download link to it. The optimized derivative of the licensed track MAY ship only as integrated media, MUST be lazy-fetched after the user's first gesture (zero track bytes on page load), and MUST NOT be offered for standalone download or redistribution. Dist exclusion MUST distinguish the prohibited raw/source/official/fan Persona soundtrack from the allowed licensed derivative: no raw or source audio and no official or fan soundtrack MAY appear in the output, and the registered licensed derivative MAY appear only as integrated media.

#### Scenario: Raw source never ships as a download

- GIVEN the production build output
- WHEN it is scanned for `assets/music/background.mp3`, raw audio bytes, and download links
- THEN no raw/source MP3 and no direct download link appear in the output

#### Scenario: Derivative is integrated and gesture-gated

- GIVEN the production site with the derivative present
- WHEN page-load network activity is captured before and after the first gesture
- THEN zero music bytes are fetched before the gesture and the derivative loads as integrated media only after it

#### Scenario: Dist exclusion separates prohibited from allowed audio

- GIVEN the dist audio scan
- WHEN audio files are classified against the provenance register
- THEN no raw/source audio and no official or fan Persona soundtrack appear, and the registered licensed derivative appears only as integrated media
