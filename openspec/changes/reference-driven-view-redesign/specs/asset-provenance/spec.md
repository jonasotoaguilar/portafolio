# Asset Provenance Specification

## Purpose

Provenance and licensing for every production visual and music asset: a register recording owner-created original artwork, external assets, and the licensed background track with exact licensing fields, rejection rules for unlicensed or Persona-derived material, and pipeline integrity — optimized derivatives generated from untouched originals, reference material never shipped.

## Requirements

### Requirement: Provenance register

The system MUST maintain a provenance register in the repository with an entry for every asset shipped from `assets/persona`, `assets/sprites`, and `assets/music`. Each entry MUST record the file name, the origin class (owner-created, external, or licensed music), the license, and the usage role; licensed music entries MUST additionally record every field required by the licensed-music requirement. A validation gate MUST fail when a production asset has no register entry or an entry missing any required field.

#### Scenario: Every shipped asset has an entry

- GIVEN the production asset list and the register
- WHEN each shipped persona, sprite, and music asset is looked up
- THEN an entry exists with file, origin class, license, and usage role

#### Scenario: Unregistered asset fails the gate

- GIVEN a production asset without a register entry
- WHEN the validation gate runs
- THEN the gate fails the change

### Requirement: Sprite directory is canonical

The system MUST source decorative and repeatable assets from `assets/sprites`. The former `assets/icon` directory MUST NOT exist and MUST NOT be reintroduced as an alias, symlink, fallback, duplicate directory, or compatibility path; no source path, spec reference, or production reference MAY resolve through `assets/icon`. Where naming is contractual (asset paths, usage roles), the sprite role replaces the icon role; component identifiers are not contractual and MAY be decided by design.

#### Scenario: No icon alias remains

- GIVEN the repository asset tree
- WHEN it is scanned for `assets/icon` aliases, symlinks, fallbacks, duplicates, or compat paths
- THEN none exists and every decorative/repeatable asset resolves under `assets/sprites`

### Requirement: Owner-created asset entries

Owner-created original assets MUST be recorded with creator "Jonathan Soto", commercial-use permission "permitted", and modification permission "permitted".

#### Scenario: Originals carry owner fields

- GIVEN the register
- WHEN an owner-created persona or sprite entry is read
- THEN it records creator Jonathan Soto and commercial and modification permissions as permitted

### Requirement: External asset entries

Every external visual asset MUST record an exact source URL, the license, attribution, commercial-use permission, and modification permission. External visual assets MUST be CC0 or MIT licensed; an external visual asset under any other license MUST NOT be used. External music MUST be licensed under the Pixabay Content License and MUST record the fields required by the licensed-music requirement. An external entry missing any required field MUST be rejected.

#### Scenario: External fields complete

- GIVEN a CC0 or MIT external visual asset in use
- WHEN its register entry is read
- THEN source URL, license, attribution, commercial-use, and modification fields are all present and exact

#### Scenario: Wrong or missing license rejected

- GIVEN an external asset with an unknown license or a missing required field
- WHEN the register is validated
- THEN the asset is rejected and MUST NOT ship

### Requirement: Licensed music entries (Pixabay Content License)

Each licensed music entry MUST record: title; creator/uploader; source URL; license name and license URL; acquisition date; local source path; production derivative path; commercial-use permission; modification permission; attribution requirement/credit; `standalone-redistribution=false`; a Content ID registered flag; an AI-modified/generated flag; and a manual identity-confirmation/hash state recording that identity was confirmed manually from user-supplied data, not hash-compared against the source page. Music with an unknown license, no source URL, or any missing required field MUST NOT ship. The production track entry is "Acid Jazz Groove" by alex-morgan under the Pixabay Content License, source URL https://pixabay.com/music/cafe-acid-jazz-groove-517096/: attribution optional, commercial and modification permitted, standalone redistribution prohibited, Content ID registered, AI modified/generated flagged, identity manually confirmed.

#### Scenario: Production track entry is complete

- GIVEN the register
- WHEN the production track entry ("Acid Jazz Groove", alex-morgan) is read
- THEN it records all required music fields, including the exact source URL https://pixabay.com/music/cafe-acid-jazz-groove-517096/, `standalone-redistribution=false`, the Content ID flag, the AI-modified/generated flag, and a manual identity confirmation not hash-compared to the page

#### Scenario: Unknown or source-less music rejected

- GIVEN candidate music with an unknown license or no source URL
- WHEN the register is validated
- THEN the music is rejected and MUST NOT ship

### Requirement: Official and fan Persona assets prohibited

Assets with an unknown license MUST NOT be shipped. Assets derived from, depicting, or reproducing official or fan Persona (ATLUS) classes — characters, logos, screenshots, artwork, fonts, or the soundtrack — MUST NOT be used as production assets. The only audio that MAY ship is the registered Pixabay-licensed derivative (see ambient-audio); no official or fan soundtrack or SFX MAY be bundled.

#### Scenario: Unknown license blocked

- GIVEN a candidate asset with no license or an unknown license
- WHEN the register is validated
- THEN the asset is rejected and never appears in production output

#### Scenario: No Persona-derived assets

- GIVEN the production source and output
- WHEN all assets are inspected against the register
- THEN no official or fan Persona character art, logo, screenshot, font, or soundtrack audio ships, and the only audio present is the registered licensed derivative

### Requirement: Optimization pipeline integrity

Selected source PNGs MAY be optimized into responsive production derivatives (format and width variants). Original source files under `assets/persona` and `assets/sprites` MUST remain unmodified, and derivatives MUST be regenerable from the originals. The music source `assets/music/background.mp3` MUST remain unmodified and the production derivative MUST be regenerable from it. Reference images under `docs/assets/mockup`, `docs/assets/asset_sheet`, and `docs/assets/example` MUST NOT be copied into production output.

#### Scenario: Originals remain untouched

- GIVEN the optimization pipeline run
- WHEN the original persona and sprite PNGs and the music source are inspected
- THEN their bytes are unchanged and derivatives are generated separately

#### Scenario: Mockups and sheets never ship

- GIVEN the production build output
- WHEN it is scanned for reference images
- THEN no `docs/assets/mockup`, `docs/assets/asset_sheet`, or `docs/assets/example` file appears in the output
