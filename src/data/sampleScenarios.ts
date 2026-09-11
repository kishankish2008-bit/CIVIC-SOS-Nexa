import { SampleScenario } from '../types';

export const SAMPLE_SCENARIOS: SampleScenario[] = [
  {
    id: 'emergency-accident',
    title: '1. Roadway Accident & Emergency Dispatch',
    category: 'Accident Response',
    summary: 'Two vehicles collided at intersection. Smoke visible, live location active.',
    urgency: 'critical',
    iconName: 'AlertTriangle',
    input: {
      text: `EMERGENCY DISPATCH: Severe multi-vehicle collision at arterial junction near 12th Cross and Main Ring Road. Heavy frontal impact between commercial truck and sedan. Fluid leaking onto asphalt, white smoke from engine bay. 2 passengers trapped inside vehicle, driver conscious but immobilized with leg injury. Immediate ambulance dispatch (112), fire tender cordon, and fastest trauma facility needed right now.`,
      mediaNote: 'Field scene capture & emergency audio voice recording.',
      mediaName: 'Intersection_Accident_Scene.jpg',
      mediaMimeType: 'image/jpeg'
    }
  },
  {
    id: 'traffic-routing',
    title: '2. Urgent Transit & Live Traffic Navigation',
    category: 'Traffic & Routing',
    summary: 'I need to reach the hospital as fast as possible. Heavy rain and congestion.',
    urgency: 'high',
    iconName: 'Car',
    input: {
      text: `TRAFFIC TRANSIT COMMAND: I need to reach Apex Trauma & Multi-Specialty Hospital as fast as possible. Torrential rainfall has started causing localized surface waterlogging along Primary Arterial Boulevard. Navigation shows severe congestion. What is the fastest verified route right now comparing Route A, Route B, and Route C?`,
      mediaNote: 'Live traffic congestion camera frame.',
      mediaName: 'Arterial_Traffic_Monitor.jpg',
      mediaMimeType: 'image/jpeg'
    }
  },
  {
    id: 'current-news-factcheck',
    title: '3. Current Events & Live Ground Truth',
    category: 'Search & Verification',
    summary: 'What is happening right now? Ground with real-time Google Search.',
    urgency: 'medium',
    iconName: 'Globe',
    input: {
      text: `LIVE FACT CHECK & CURRENT EVENTS: Search Google for the latest verified official weather advisories and emergency public safety bulletins for major metropolitan regions today. What are the confirmed facts, official warnings, and remaining uncertainties?`,
      mediaNote: 'Public safety notice screenshot.',
      mediaName: 'Weather_Advisory_Bulletin.png',
      mediaMimeType: 'image/png'
    }
  },
  {
    id: 'pdf-document-action',
    title: '4. Document Ingestion & Structured Facts',
    category: 'Document Analysis',
    summary: 'Analyze clinical lab report PDF. Extract structured facts and uncertainties.',
    urgency: 'high',
    iconName: 'FileText',
    input: {
      text: `PATIENT CLINICAL SUMMARY: Attached pathology bloodwork panel from City Health Diagnostics. Patient shows Elevated Troponin I (0.42 ng/mL, ref <0.04), Serum Creatinine 2.1 mg/dL, and fasting glucose 185 mg/dL with persistent retrosternal pressure. Extract structured observations, state verified medical laboratory facts, and identify critical clinical uncertainties without diagnosing.`,
      mediaNote: 'Clinical Lab Pathology Report PDF attached.',
      mediaName: 'Clinical_Pathology_Panel.pdf',
      mediaMimeType: 'application/pdf'
    }
  },
  {
    id: 'url-intel-context',
    title: '5. Web URL Context & Fact Extraction',
    category: 'URL Ingestion',
    summary: 'Ingest live URL. Summarize key claims, verified facts, and discrepancies.',
    urgency: 'medium',
    iconName: 'ExternalLink',
    input: {
      text: `URL CONTEXT INGESTION: Ingest and analyze public safety advisory from https://news.google.com. Extract verified factual developments, timeline of events, and identify missing or unconfirmed details.`,
      mediaNote: 'Live web link target for direct ingestion.',
      mediaName: 'Web_Advisory_Link.url',
      mediaMimeType: 'text/uri-list'
    }
  },
  {
    id: 'numerical-data-code-exec',
    title: '6. Numerical Calculations & Code Execution',
    category: 'Data & Computation',
    summary: 'Execute code in isolated sandbox to calculate cold-chain degradation metrics.',
    urgency: 'high',
    iconName: 'Calculator',
    input: {
      text: `COMPUTATIONAL ENGINE: Reefer container HLXU-984210 carrying 12,000 biological units experienced compressor trip. Sensor readings recorded hourly temperatures: [2.1, 2.4, 3.8, 5.2, 6.8, 7.4, 8.1] °C. Standard maximum cold-chain threshold is 4.0°C. Calculate total degree-hours above threshold, mean excursion temperature, standard deviation, and estimated time remaining before irreversible degradation.`,
      mediaNote: 'IoT Thermal Datalogger CSV attached.',
      mediaName: 'Thermal_Excursion_Log.csv',
      mediaMimeType: 'text/csv'
    }
  },
  {
    id: 'medical-triage-emergency',
    title: '7. Medical Emergency & Clinical Safety Gate',
    category: 'Medical Safety',
    summary: 'Person experiencing acute chest pain. Clinical safety notice & nearest trauma care.',
    urgency: 'critical',
    iconName: 'HeartPulse',
    input: {
      text: `ACUTE MEDICAL ALERT: 58-year-old individual experiencing sudden intense crushing chest pain radiating to left arm and jaw for the past 20 minutes, accompanied by diaphoresis and shortness of breath. History of hypertension. Need immediate triage guidance, nearest emergency hospital with catheterization lab, and emergency ambulance dispatch (112).`,
      mediaNote: 'Telemetry & emergency voice memo recorded.',
      mediaName: 'Emergency_Triage_Voice.mp3',
      mediaMimeType: 'audio/mp3'
    }
  }
];

