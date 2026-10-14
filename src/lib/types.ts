/**
 * Types กลางของ Cozypet (PROMPT.md หัวข้อ 10.2) — ทุกหน้าจอต้องใช้ชุดนี้
 */

export type Species = 'cat' | 'dog' | 'other';
/** UI groups for the demo catalogue; backend matching retains the three Species values. */
export type AnimalKind = 'cat' | 'dog' | 'rabbit' | 'bird' | 'guinea-pig' | 'hamster' | 'other';
export type MascotKind = 'cat' | 'dog';
export type DistrictId = string; // ต้องมีอยู่ใน src/data/districts.ts
export interface GeoPoint { lat: number; lng: number }

export type AccountRole = 'supporter' | 'shelter';
export type ShelterPublication = 'draft' | 'published' | 'paused' | 'archived';
export interface ShelterPet {
  id: string; name: string; species: Species; breed: string; age: string;
  status: 'available' | 'foster' | 'adopted'; description: string; photo?: MediaRef;
}
export interface ShelterPayload {
  name: string; organisationType: 'foundation' | 'shelter' | 'independent';
  /** User-entered demo value. Required only when organisationType is foundation; not verified. */
  registrationNumber?: string;
  districtId: DistrictId; location: GeoPoint; address: string; description: string;
  speciesAccepted: Species[]; careModes: CareMode[]; capacityTotal: number; currentCount: number;
  foodDays: number; litterDays?: number; acceptsEmergency: boolean; hours: string;
  conditions: string; donationsEnabled: boolean; donationNeeds: string;
  contactInstructions: string; photos: MediaRef[]; pets: ShelterPet[];
}
export interface PublicShelter {
  id: string; registrationDemoId: string; status: ShelterPublication;
  payload: ShelterPayload; version: number; createdAt: string; updatedAt: string; isDemo: true;
}
export interface ShelterInquiry {
  id: string; placeId: string; senderName: string; type: 'intake' | 'adopt' | 'contact';
  body: string; reply: string; status: 'pending' | 'replied' | 'closed'; createdAt: string;
}
export interface MediaRef {
  src: string;
  alt: string;
  /** Private Supabase object path; public API issues short-lived URLs after RLS checks. */
  storagePath?: string;
  creditId?: string;
  aiGenerated?: boolean;
  /** ภาพถ่ายหลายช่องในไฟล์เดียว: index นับซ้ายไปขวา บนลงล่าง เริ่ม 0 */
  atlas?: {
    columns: number;
    rows: number;
    index: number;
    /** Native crop for sheets whose generated grid has uneven row heights. */
    crop?: { x: number; y: number; width: number; height: number; sheetWidth: number; sheetHeight: number };
  };
}

export type PersonaRef =
  | { kind: 'owner'; id: string }
  | { kind: 'shelter'; id: string }
  | { kind: 'individual'; id: string };

export interface PersonaVoice {
  speakerLabel: string;
  politeParticle: 'ค่ะ' | 'ครับ';
  tone: string;
  facts: string[];
}

export interface OwnerProfile {
  id: string;
  displayName: string;
  districtId: DistrictId;
  listingIds: string[];
  photo?: MediaRef;
  persona: PersonaVoice;
  isDemo: true;
}

export type ListingType = 'lost' | 'found' | 'adoption';
export type CollarStatus = 'yes' | 'no' | 'unknown';
export interface PetListing {
  id: string;
  type: ListingType;
  source: 'seed' | 'user';
  runNumber?: number;
  species: Species;
  speciesOther?: string;
  breed?: string;
  breedId?: string;
  name?: string;
  sex?: 'male' | 'female' | 'unknown';
  colors: string[]; // id จาก src/data/colors.ts
  markings?: string;
  collar: { status: CollarStatus; detail?: string };
  districtId: DistrictId;
  eventAt: string;
  photo?: MediaRef;
  description?: string;
  postedBy: PersonaRef | { kind: 'tester' };
  careHolderId?: string;
  urgency?: Urgency;
  status: 'open' | 'closed';
  closedReason?: 'reunited' | 'in_care' | 'adopted' | 'other';
  createdAt: string;
  updatedAt: string;
  isDemo: true;
}

export interface SuccessStory {
  id: string;
  listingId?: string;
  petName: string;
  species: Species;
  breed?: string;
  outcome: 'adopted' | 'reunited';
  date: string;
  summary: string;
  body: string;
  photo: MediaRef;
  helperId?: string;
  isDemo: true;
}

export type HomeType = 'condo' | 'apartment' | 'townhouse' | 'house' | 'shophouse' | 'wooden_house';
export interface HomeInfo {
  type: HomeType;
  summary: string;
}
export interface CurrentPet {
  name: string;
  species: Species;
  breed: string;
  color: string;
  sex: 'male' | 'female';
  ageYears: number;
  note?: string;
  photo?: MediaRef;
}
export interface CarePreferences { colors: string[]; breeds: string[]; reason: string }
export interface HelperImages {
  profile?: MediaRef;
  home?: MediaRef;
  pets?: MediaRef;
  place?: MediaRef[];
}

export type CareMode = 'foster' | 'adopt';
export type Availability = 'available' | 'limited' | 'unavailable';
export interface HelperProfile {
  id: string;
  kind: 'shelter' | 'individual';
  displayName: string;
  displayNameEn?: string;
  districtId: DistrictId;
  location: GeoPoint;
  speciesAccepted: Species[];
  careModes: CareMode[];
  capacityTotal: number;
  currentCount: number;
  availability: Availability;
  acceptsEmergency: boolean;
  hours: string;
  conditions: string[];
  description: string;
  images: HelperImages;
  age?: number;
  sex?: 'male' | 'female';
  occupation?: string;
  home?: HomeInfo;
  currentPets?: CurrentPet[];
  preferences?: CarePreferences;
  isRealOrganization?: boolean;
  /** Public, user-managed mock shelter stored in the shared directory. */
  publicPlaceId?: string;
  /** Business demo only; never an assertion about a registered organisation. */
  isFictionalFoundation?: true;
  /** shelter: ช่องที่ยังรอทีมเติมข้อมูลองค์กรจริง (ห้ามแต่งองค์กร) */
  isPlaceholder?: boolean;
  /** shelter: ที่มาและสถานะการตรวจข้อมูลองค์กรจริง */
  verification?: string;
  officialUrl?: string;
  demoVerified: boolean;
  donationsEnabled: boolean;
  donationNote?: string;
  acceptsSupplyPackages?: boolean;
  persona: PersonaVoice;
  isDemo: true;
}

export interface DemoSession {
  runNumber: number | null;
  mascot: MascotKind;
  findingIndexByRun: Record<string, number>;
  chatMode: 'auto' | 'demo_only';
  soundEnabled: boolean;
  locale: Locale;
  startedAt: string;
  updatedAt: string;
}

export interface FindingSession {
  id: string;
  runNumber: number;
  findingIndex: number;
  origin: 'run_seed' | 'district_choice';
  districtId: DistrictId;
  searchPoint: GeoPoint;
  seedKey: string;
  createdAt: string;
}

export type FallbackReason =
  | 'ai_disabled' | 'demo_only' | 'misconfigured' | 'model_not_allowed' | 'rate_limited'
  | 'quota_exceeded' | 'timeout' | 'upstream_error' | 'blocked' | 'network';

export type ProviderId = 'gemini' | 'groq' | 'openrouter';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  createdAt: string;
  status: 'sending' | 'read' | 'failed';
  readAt?: string;
  source?: 'ai' | 'fallback';
  provider?: ProviderId;
  model?: string;
  fallbackReason?: FallbackReason;
  /** ข้อความระบบ: การ์ดส่งต่อน้อง (อ้าง Handoff) */
  handoffId?: string;
}

export interface Conversation {
  id: string;
  runNumber: number;
  persona: PersonaRef;
  listingId?: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export type RequestType = 'intake' | 'foster' | 'adopt';
export interface CareRequest {
  id: string;
  runNumber: number;
  type: RequestType;
  helperId: string;
  listingId?: string;
  answers: Record<string, string | boolean>;
  status: 'pending_contact' | 'cancelled' | 'completed_demo';
  createdAt: string;
  updatedAt: string;
}

export interface SavedItem { kind: 'listing' | 'helper'; id: string; savedAt: string }

export interface Handoff {
  id: string;
  runNumber: number;
  conversationId: string;
  helperId: string;
  listingId?: string;
  petName: string;
  species: Species;
  mode: 'intake' | 'foster' | 'adopt';
  createdAt: string;
  isDemo: true;
}

// ---------- D13–D16 ----------
export type Locale = 'th' | 'en';
export interface LocalizedText { th: string; en: string }
export type Urgency = 'normal' | 'soon' | 'emergency';
export type HelpType = 'intake' | 'donate' | 'adopt';
export type StatusLevel = 'open' | 'tight' | 'full';
export type SupplyLevel = 'ok' | 'low' | 'critical';

export interface HelperSupplies {
  helperId: string;
  foodDays: number;
  litterDays?: number;
  recentPackages30d: number;
  updatedAt: string;
}

export type ReasonCode =
  | 'has_space' | 'most_space_nearby' | 'closest_with_space' | 'accepts_species' | 'accepts_emergency'
  | 'food_critical' | 'food_low' | 'litter_low' | 'few_recent_packages' | 'nearly_full'
  | 'crowded_holder' | 'long_wait' | 'matches_history' | 'your_place';
export interface Reason { code: ReasonCode; params: Record<string, string | number> }

export interface ScoreFactor { key: string; weight: number; value: number; rawLabel: string }
export interface Recommendation {
  id: string;
  score: number;
  factors: ScoreFactor[];
  reasons: Reason[];
  distanceKm?: number;
}
export type ExclusionKey = 'full' | 'species' | 'unavailable' | 'emergency' | 'mode';
export interface RankingResult {
  items: Recommendation[];
  excluded: Record<ExclusionKey, number>;
}

export type AssistSignal = 'injured' | 'sick' | 'trapped' | 'hungry' | 'young_alone' | 'aggressive';
export interface AssistIntakeResult {
  helpType: HelpType | 'unknown';
  species: Species | 'unknown';
  ageGroup: 'young' | 'adult' | 'unknown';
  urgency: Urgency | 'unknown';
  signals: AssistSignal[];
  districtId: DistrictId | null;
  needsVet: boolean;
  summary: string;
  source: 'ai' | 'rules';
  provider?: ProviderId;
  fallbackReason?: FallbackReason;
}

export interface PartnerBrand { id: string; name: LocalizedText; isFictional: true }
export interface DonationPackage {
  id: string;
  name: LocalizedText;
  items: LocalizedText[];
  species: Species[];
  priceTHB: number;
  platformSharePct: number;
  effect: { foodDays?: number; litterDays?: number };
  brandId: string;
}
export interface DonationOrder {
  id: string;
  runNumber: number;
  helperId: string;
  packageId: string;
  quantity: number;
  unitPriceTHB: number;
  recommendedRank?: number;
  status: 'active' | 'cancelled';
  createdAt: string;
  fastForwarded?: boolean;
  platformSharePct?: number;
  settlementStage?: 'received' | 'commissioned' | 'partner_paid';
  fulfillmentStartedAt?: string;
  source?: 'donor' | 'csr' | 'micro';
  sponsorshipBookingId?: string;
  paymentSessionId?: string;
  demoConfirmedAt?: string;
  recipientSnapshot?: { name:string;placeId:string;districtId:string;location:GeoPoint;foodDays:number;litterDays?:number;species:Species[] };
  isDemo: true;
}

export interface PartnerBooking {
  id: string;
  runNumber: number;
  brandId: string;
  kind: 'advertisement' | 'csr';
  placement: 'home' | 'dashboard';
  species: Species | 'all';
  durationDays: number;
  feeTHB: number;
  aidBudgetTHB: number;
  campaignId?: string;
  aidOrder?: DonationOrder;
  status: 'active' | 'cancelled';
  createdAt: string;
  isDemo: true;
}
export interface MicroDonation {
  id: string; runNumber: number; helperId: string; amountTHB: number; createdAt: string; isDemo: true;
}
export interface CareReview {
  id: string; runNumber: number; helperId: string; rating: number; comment: string; createdAt: string; isDemo: true;
}
export interface DeliveryReceipt {
  id: string; runNumber: number; helperId: string; orderId: string; image: MediaRef; note: string; createdAt: string; isDemo: true;
}
export interface BusinessState {
  bookings: PartnerBooking[]; microDonations: MicroDonation[]; reviews: CareReview[]; receipts: DeliveryReceipt[];
}

export interface CaretakerPlace {
  id: string;
  runNumber: number;
  displayName: string;
  districtId: DistrictId;
  location: GeoPoint;
  speciesAccepted: Species[];
  careModes: CareMode[];
  capacityTotal: number;
  currentCount: number;
  acceptsEmergency: boolean;
  foodDays: number;
  litterDays?: number;
  updatedAt: string;
  /** วันที่ (เวลาไทย) ที่อัปเดต ใช้คิดแต้มสูงสุดวันละ 1 ครั้ง */
  updateDays?: string[];
  isDemo: true;
}

export interface SearchHistoryEntry { at: string; helpType: HelpType; species: Species; urgency: Urgency; districtId?: DistrictId }

export type UrgentCase =
  | { kind: 'supplies'; helperId: string; level: SupplyLevel; reasons: Reason[] }
  | { kind: 'listing'; listingId: string; urgency: Urgency; reasons: Reason[] };

export type ActivityKind = 'listing_found' | 'listing_lost' | 'request_intake' | 'request_care' | 'handoff' | 'order' | 'micro' | 'place_update';
export interface ActivityEntry {
  kind: ActivityKind;
  refId: string;
  at: string;
  points: number;
}

export interface AccountProfile {
  id: string;
  displayName: string;
  avatarUrl?: string;
  locale: Locale;
  runNumber: number | null;
  mascot: MascotKind;
}

// ---------- D19 ----------
export interface TourStep {
  id: string;
  route: string;
  target: string;
  kind: 'explain' | 'try' | 'demo';
  placement?: 'auto' | 'top' | 'bottom' | 'left' | 'right';
  titleKey: string;
  bodyKey: string;
  ipo?: 'input' | 'process' | 'output';
  advanceOn?: 'click-target';
  action?: { type: 'tap'; safeTarget: string } | { type: 'type'; safeTarget: string; textKey: string };
  motionKit?: 'PawTrail' | 'RadarSweep' | 'WaterColumns' | 'RouteFlow' | 'HeartBurst';
}
export interface TourState {
  dismissedHint: boolean;
  completedPages: string[];
  updatedAt: string;
}
