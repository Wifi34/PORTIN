/**
 * PortIN Cargo Intelligence & Maritime Classification Engine
 * Calibrated against IMO IMSBC Code (International Maritime Solid Bulk Cargoes),
 * Baltic Exchange commodity standards, and industrial port operations on the Indian East Coast.
 */

export interface CargoIntelligence {
  materialName: string;
  category: 'Heavy Metallurgical Ore' | 'Thermal Energy / Coal' | 'Agricultural Bulk' | 'Mineral Concentrate' | 'Chemical / Fertilizer' | 'Minor Industrial Bulk' | 'Finished Steel / Breakbulk';
  stowageFactorM3PerMt: number; // m3 / MT
  stowageFactorCuftPerLt: number; // cu.ft / LT
  bulkDensityMtPerM3: number; // MT / m3
  imsbcGroup: 'Group A' | 'Group B' | 'Group C';
  hazardWarning: string;
  handlingEquipment: string;
  targetLoadingRateTph: string;
  recommendedVesselClass: string;
  marketRateSpreadUsd: number; // Delta vs benchmark Baltic Panamax/Capesize
  holdPreparation: string;
}

interface KnownCommodityRule {
  pattern: RegExp;
  data: Omit<CargoIntelligence, 'materialName'>;
}

const KNOWN_COMMODITY_RULES: KnownCommodityRule[] = [
  // 1. Coking & Metallurgical Coal
  {
    pattern: /(coking|met\s*coal|prime\s*hard|metallurgical\s*coal|pci|anthracite)/i,
    data: {
      category: 'Heavy Metallurgical Ore',
      stowageFactorM3PerMt: 1.25,
      stowageFactorCuftPerLt: 45.0,
      bulkDensityMtPerM3: 0.80,
      imsbcGroup: 'Group B',
      hazardWarning: 'Methane emission & self-heating risk. Gas monitoring & sealed cargo hold atmosphere mandatory.',
      handlingEquipment: 'High-speed Grab Gantry Unloaders (GSU) & Stacker Reclaimers',
      targetLoadingRateTph: '18,000 – 25,000 TPH',
      recommendedVesselClass: 'Capesize / Panamax',
      marketRateSpreadUsd: 0.0,
      holdPreparation: 'Swept, dry, and gas-monitored bulk holds',
    },
  },
  // 2. Thermal / Steam Coal
  {
    pattern: /(thermal|steam\s*coal|sub-bituminous|lignite|boiler\s*coal)/i,
    data: {
      category: 'Thermal Energy / Coal',
      stowageFactorM3PerMt: 1.30,
      stowageFactorCuftPerLt: 46.5,
      bulkDensityMtPerM3: 0.77,
      imsbcGroup: 'Group B',
      hazardWarning: 'Spontaneous combustion risk at moisture >12%. Monitor boundary bulk temperatures daily.',
      handlingEquipment: 'Continuous Ship Unloaders (CSU) & High-Capacity Clamshell Grabs',
      targetLoadingRateTph: '15,000 – 22,000 TPH',
      recommendedVesselClass: 'Panamax / Supramax',
      marketRateSpreadUsd: -0.40,
      holdPreparation: 'Standard coal-cleaned holds with bilge strainers secured',
    },
  },
  // 3. Iron Ore (Fines, Lump, Pellets)
  {
    pattern: /(iron\s*ore|fines|lump|pellet|hematite|magnetite|sinter)/i,
    data: {
      category: 'Heavy Metallurgical Ore',
      stowageFactorM3PerMt: 0.42,
      stowageFactorCuftPerLt: 15.0,
      bulkDensityMtPerM3: 2.38,
      imsbcGroup: 'Group A',
      hazardWarning: 'High density ore. Fines liable to liquefaction if moisture exceeds TML. Tank-top strength check required.',
      handlingEquipment: 'Heavy-Duty Travelling Gantry Unloaders & Conveyor Stacking System',
      targetLoadingRateTph: '25,000 – 35,000 TPH',
      recommendedVesselClass: 'Capesize / Very Large Ore Carrier (VLOC)',
      marketRateSpreadUsd: -0.60,
      holdPreparation: 'Heavy tank-top certified (>25 MT/m²), strictly dry and bilge wells covered with burlap',
    },
  },
  // 4. Manganese Ore
  {
    pattern: /(manganese|mn\s*ore)/i,
    data: {
      category: 'Heavy Metallurgical Ore',
      stowageFactorM3PerMt: 0.48,
      stowageFactorCuftPerLt: 17.2,
      bulkDensityMtPerM3: 2.08,
      imsbcGroup: 'Group C',
      hazardWarning: 'Very high density cargo with extreme localized tank-top stress. Self-trimming required.',
      handlingEquipment: 'Mechanical Grabs & Heavy Mobile Harbour Cranes',
      targetLoadingRateTph: '10,000 – 16,000 TPH',
      recommendedVesselClass: 'Panamax / Ultramax',
      marketRateSpreadUsd: +0.75,
      holdPreparation: 'High load tank-top verification, dry holds',
    },
  },
  // 5. Nickel Ore
  {
    pattern: /(nickel|ni\s*ore|laterite)/i,
    data: {
      category: 'Mineral Concentrate',
      stowageFactorM3PerMt: 0.72,
      stowageFactorCuftPerLt: 25.8,
      bulkDensityMtPerM3: 1.39,
      imsbcGroup: 'Group A',
      hazardWarning: 'EXTREME LIQUEFACTION RISK. Shipper must supply certified TML and Can-Test verification prior to loading.',
      handlingEquipment: 'Dedicated grab cranes under covered weather shelter',
      targetLoadingRateTph: '8,000 – 12,000 TPH',
      recommendedVesselClass: 'Supramax / Handymax (Geared)',
      marketRateSpreadUsd: +1.60,
      holdPreparation: 'Watertight hatches, bilge sounding pipes clear, moisture test certification',
    },
  },
  // 6. Copper / Zinc / Lead Concentrates
  {
    pattern: /(copper|zinc|lead|mineral\s*concentrate|pyrite)/i,
    data: {
      category: 'Mineral Concentrate',
      stowageFactorM3PerMt: 0.50,
      stowageFactorCuftPerLt: 18.0,
      bulkDensityMtPerM3: 2.00,
      imsbcGroup: 'Group A',
      hazardWarning: 'Prone to rapid dynamic liquefaction during marine transit. Mandatory TML compliance.',
      handlingEquipment: 'Specialized Sealed Grabs & Dust Suppression Hoppers',
      targetLoadingRateTph: '6,000 – 10,000 TPH',
      recommendedVesselClass: 'Supramax / Handysize',
      marketRateSpreadUsd: +1.40,
      holdPreparation: 'Trimming required, dry bilges, sealed hatch coamings',
    },
  },
  // 7. Bauxite & Alumina
  {
    pattern: /(bauxite|alumina|aluminum\s*ore)/i,
    data: {
      category: 'Mineral Concentrate',
      stowageFactorM3PerMt: 0.82,
      stowageFactorCuftPerLt: 29.4,
      bulkDensityMtPerM3: 1.22,
      imsbcGroup: 'Group A',
      hazardWarning: 'Group A liquefaction risk for high-fines bauxite. Dynamic moisture monitoring mandatory.',
      handlingEquipment: 'Grab Unloaders with High-Volume Hopper Conveyors',
      targetLoadingRateTph: '14,000 – 20,000 TPH',
      recommendedVesselClass: 'Capesize / Kamsarmax',
      marketRateSpreadUsd: +0.30,
      holdPreparation: 'Clean, dry holds, tested bilge pumps',
    },
  },
  // 8. Limestone, Dolomite & Gypsum
  {
    pattern: /(limestone|dolomite|gypsum|flux|aggregate|clinker)/i,
    data: {
      category: 'Minor Industrial Bulk',
      stowageFactorM3PerMt: 0.78,
      stowageFactorCuftPerLt: 28.0,
      bulkDensityMtPerM3: 1.28,
      imsbcGroup: 'Group C',
      hazardWarning: 'Inert non-cohesive bulk. Low chemical hazard. High abrasive dust generation.',
      handlingEquipment: 'Mobile Harbour Cranes, Hoppers & Truck Loading Stations',
      targetLoadingRateTph: '12,000 – 18,000 TPH',
      recommendedVesselClass: 'Panamax / Supramax',
      marketRateSpreadUsd: -0.25,
      holdPreparation: 'Standard dry bulk sweep, hatch seals greased',
    },
  },
  // 9. Grain (Wheat, Corn, Soybeans, Barley)
  {
    pattern: /(grain|wheat|corn|maize|soybean|barley|rice|sorghum)/i,
    data: {
      category: 'Agricultural Bulk',
      stowageFactorM3PerMt: 1.45,
      stowageFactorCuftPerLt: 52.0,
      bulkDensityMtPerM3: 0.69,
      imsbcGroup: 'Group C',
      hazardWarning: 'High volume, low density. IMO Grain Rules apply: hold shifting boards/strapping mandatory. Infestation risk.',
      handlingEquipment: 'Pneumatic Grain Vacuums, Enclosed Tower Unloaders & Marine Elevators',
      targetLoadingRateTph: '5,000 – 9,000 TPH',
      recommendedVesselClass: 'Panamax / Ultramax',
      marketRateSpreadUsd: +1.10,
      holdPreparation: 'Grain-Clean certified hold inspection (Zero rust scale, zero paint flakes, zero odor)',
    },
  },
  // 10. Fertilizer (Urea, DAP, MOP, Sulfur)
  {
    pattern: /(fertilizer|urea|dap|mop|potash|phosphate|sulfur|sulphur|ammonium)/i,
    data: {
      category: 'Chemical / Fertilizer',
      stowageFactorM3PerMt: 1.15,
      stowageFactorCuftPerLt: 41.2,
      bulkDensityMtPerM3: 0.87,
      imsbcGroup: 'Group B',
      hazardWarning: 'Hygroscopic commodity. High water sensitivity causing cake formation. Corrosive in contact with moisture.',
      handlingEquipment: 'Dedicated Weather-Protected Grabs & Bagging Plants',
      targetLoadingRateTph: '4,000 – 7,500 TPH',
      recommendedVesselClass: 'Supramax / Handysize (Geared)',
      marketRateSpreadUsd: +0.85,
      holdPreparation: 'Hospital-clean dry holds, lime-washed bulkhead protection against acidic corrosion',
    },
  },
  // 11. Petcoke (Petroleum Coke)
  {
    pattern: /(petcoke|petroleum\s*coke|calcined\s*coke)/i,
    data: {
      category: 'Minor Industrial Bulk',
      stowageFactorM3PerMt: 1.20,
      stowageFactorCuftPerLt: 43.0,
      bulkDensityMtPerM3: 0.83,
      imsbcGroup: 'Group B',
      hazardWarning: 'Combustible fine dust. High sulfur content can corrode ship tank-tops if damp. Self-heating risk.',
      handlingEquipment: 'Water-Misted Grab Unloaders & Covered Conveyors',
      targetLoadingRateTph: '10,000 – 15,000 TPH',
      recommendedVesselClass: 'Panamax / Supramax',
      marketRateSpreadUsd: +0.65,
      holdPreparation: 'Barrier coating / lime wash required to avoid sulfur pitting on steel plates',
    },
  },
  // 12. Steel & Breakbulk (Coils, Plates, Billets, DRI)
  {
    pattern: /(steel|coil|hrc|crc|billet|slab|plate|rebar|dri|direct\s*reduced|hbi)/i,
    data: {
      category: 'Finished Steel / Breakbulk',
      stowageFactorM3PerMt: 0.35,
      stowageFactorCuftPerLt: 12.5,
      bulkDensityMtPerM3: 2.85,
      imsbcGroup: 'Group B',
      hazardWarning: 'Extremely concentrated load. Dunnage and lashing mandatory. DRI pellets emit hydrogen in contact with water.',
      handlingEquipment: 'Heavy-Lift Deck Cranes (35 MT+) with C-Hooks & Spreader Beams',
      targetLoadingRateTph: '3,000 – 5,500 TPH',
      recommendedVesselClass: 'Geared Ultramax / Handysize (Box-shaped holds)',
      marketRateSpreadUsd: +2.20,
      holdPreparation: 'Tank-top certified for heavy point loads (>28 MT/m²), dunnage laid, dehumidified',
    },
  },
];

/**
 * Intelligent real-time classifier that recognizes any bulk material
 * and extracts complete maritime physical properties & handling criteria.
 */
export function identifyCargoIntelligence(rawCargoName: string): CargoIntelligence {
  const clean = (rawCargoName || '').trim();
  if (!clean) {
    return {
      materialName: 'General Dry Bulk Cargo',
      category: 'Minor Industrial Bulk',
      stowageFactorM3PerMt: 1.00,
      stowageFactorCuftPerLt: 35.8,
      bulkDensityMtPerM3: 1.00,
      imsbcGroup: 'Group C',
      hazardWarning: 'General non-hazardous solid bulk cargo. Standard bulk carrier loading rules apply.',
      handlingEquipment: 'Standard Ship or Shore Grabs',
      targetLoadingRateTph: '10,000 TPH',
      recommendedVesselClass: 'Panamax / Supramax',
      marketRateSpreadUsd: 0.0,
      holdPreparation: 'Dry, swept cargo holds',
    };
  }

  // 1. Match against known rules
  for (const rule of KNOWN_COMMODITY_RULES) {
    if (rule.pattern.test(clean)) {
      return {
        materialName: clean,
        ...rule.data,
      };
    }
  }

  // 2. Intelligent heuristic deduction for novel custom cargo specifications
  const lower = clean.toLowerCase();
  let category: CargoIntelligence['category'] = 'Minor Industrial Bulk';
  let sf = 0.90;
  let density = 1.11;
  let group: 'Group A' | 'Group B' | 'Group C' = 'Group C';
  let hazard = 'Standard dry bulk specification. Maintain continuous bilge sounding and cargo trimming.';
  let gear = 'Shore Grabs & Mobile Cranes';
  let tph = '10,000 – 14,000 TPH';
  let vessel = 'Panamax / Supramax';
  let spread = 0.50;

  if (lower.includes('ore') || lower.includes('sand') || lower.includes('stone') || lower.includes('slag') || lower.includes('mineral')) {
    category = 'Heavy Metallurgical Ore';
    sf = 0.55;
    density = 1.82;
    group = lower.includes('concentrate') || lower.includes('sand') ? 'Group A' : 'Group C';
    hazard = group === 'Group A'
      ? 'Mineral particulate liable to moisture migration and dynamic liquefaction. Moisture testing required.'
      : 'High density solid bulk. Check localized tank-top permissible weight limit.';
    tph = '12,000 – 18,000 TPH';
    vessel = 'Panamax / Capesize';
    spread = 0.40;
  } else if (lower.includes('concentrate') || lower.includes('slurry') || lower.includes('fines')) {
    category = 'Mineral Concentrate';
    sf = 0.52;
    density = 1.92;
    group = 'Group A';
    hazard = 'CRITICAL: Fine-grained mineral concentrate. Strict compliance with IMSBC TML (Transportable Moisture Limit) certified.';
    tph = '8,000 – 12,000 TPH';
    vessel = 'Supramax / Handymax (Geared)';
    spread = 1.25;
  } else if (lower.includes('chemical') || lower.includes('acid') || lower.includes('nitrate')) {
    category = 'Chemical / Fertilizer';
    sf = 1.10;
    density = 0.91;
    group = 'Group B';
    hazard = 'Chemical hazard. Strict hold dryness and separation from organic matter mandatory.';
    tph = '6,000 TPH';
    vessel = 'Geared Supramax';
    spread = 1.00;
  } else if (lower.includes('seed') || lower.includes('meal') || lower.includes('agri') || lower.includes('crop')) {
    category = 'Agricultural Bulk';
    sf = 1.40;
    density = 0.71;
    group = 'Group C';
    hazard = 'Perishable agri-bulk. Venting and fumigation certification required at loading port.';
    tph = '7,000 TPH';
    vessel = 'Ultramax / Panamax';
    spread = 0.90;
  }

  return {
    materialName: clean,
    category,
    stowageFactorM3PerMt: Number(sf.toFixed(2)),
    stowageFactorCuftPerLt: Number((sf * 35.88).toFixed(1)),
    bulkDensityMtPerM3: Number(density.toFixed(2)),
    imsbcGroup: group,
    hazardWarning: hazard,
    handlingEquipment: gear,
    targetLoadingRateTph: tph,
    recommendedVesselClass: vessel,
    marketRateSpreadUsd: spread,
    holdPreparation: 'Inspected dry holds, verified bilge pump suction',
  };
}
