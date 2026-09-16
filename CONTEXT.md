# Customer Service Management (CSM)

CSM is a post-handover property care and warranty service platform used by property developers, estate operations staff, and residents to log issues, schedule inspections, manage repairs, and track warranty liability across housing projects and units.

## Language

### Warranty Domain

**Warranty Group**:
A category that groups related warranty items together for coverage, reporting, and default assignment (e.g., Structural, Architectural, Electrical).
_Avoid_: Worktype, CFR Type, Warranty Work Group (legacy code artifacts: `rd_mas_cfr_type`, `Worktype`)

**Warranty Item**:
A specific repairable component, fixture, or defect category with defined warranty duration (days, months, years, or lifetime) belonging to exactly one Warranty Group.
_Avoid_: Warranty Record, Warranty Detail, WarrentyItem (legacy typo: `WarrentyItem`, table: `rd_mas_warranty2`)

**Default Warranty Group**:
The single Warranty Group per tenant auto-selected when new Warranty Items are created.
_Avoid_: Primary group, system group

**Reference IC**:
An item imported from the central Inventory Control (IC) material master to link warranty definitions to inventory cost tracking.
_Avoid_: Ref IC, IC Item, Stock Link

### Quality Control Domain

**QC Item**:
A reusable inspection or assessment question scored during quality audits and defect handovers.
_Avoid_: Question, Check Item, CSR Item, Survey Item (legacy table: `mg_csr_qc_item`)

**QC Form**:
A compiled checklist of QC Items applied to a specific project inspection.
_Avoid_: QC Set, Inspection Template, QCC Form

### Core & Tenancy Domain

**Tenant Code**:
The alphanumeric identifier representing an independent client company or property developer partition across all database tables and API requests.
_Avoid_: Main Code, Company ID, Company Code (legacy code attribute: `maincode`)

**Project**:
A real-estate development or residential estate managed within CSM.
_Avoid_: Job, Site, Maincomp

**Unit**:
A specific residential plot, house, or condominium room within a Project.
_Avoid_: Plot, Room, House (legacy field: `pre_event` when representing unit, `house_no`)

### Logistics Domain

**Parcel**:
An inbound postal delivery or courier shipment logged at estate security for collection by a resident.
_Avoid_: Post, Mango Post, Mail, Package (legacy table: `mg_csr_post_office`)

**Parcel Tracking**:
The operational queue monitoring parcels through active, collected, and returned states with signature verification.
_Avoid_: Track and Trace, Post Status
