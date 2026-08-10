const DECIDING_VERDICTS = new Set(['PASS', 'FAIL']);
const FINALIZED_VERDICTS = new Set(['PASS', 'FAIL', 'BLOCKED', 'REJECT']);

export const APPLICABILITY_STATES = Object.freeze([
  'REQUIRED',
  'NOT_REQUIRED',
  'BLOCKED',
]);

function isFinalizedEvidence(evidence) {
  return evidence?.finalized === true && FINALIZED_VERDICTS.has(evidence.verdict);
}

function isFinalizedDecidingEvidence(evidence) {
  return evidence?.finalized === true && DECIDING_VERDICTS.has(evidence.verdict);
}

function piRpcApplicability({ piSdk, piAcp }) {
  const sdkBoundaryRequired = isFinalizedEvidence(piSdk)
    && piSdk.verdict === 'FAIL'
    && piSdk.triggers?.failedSolelyBecauseOutOfProcessBoundaryRequired === true;
  const acpTranslationIsolationRequired = isFinalizedEvidence(piAcp)
    && piAcp.verdict === 'FAIL'
    && piAcp.triggers?.failedAndRequiresPiRpcIsolation === true;

  if (sdkBoundaryRequired || acpTranslationIsolationRequired) return 'REQUIRED';
  if (!isFinalizedDecidingEvidence(piSdk) || !isFinalizedDecidingEvidence(piAcp)) return 'BLOCKED';

  const processBoundaryAmbiguous = piSdk.observations?.sdkVsPiAcpProcessBoundaryAmbiguous === true
    || piAcp.observations?.sdkVsPiAcpProcessBoundaryAmbiguous === true;
  const maintenanceCostAmbiguous = piSdk.observations?.sdkVsPiAcpMaintenanceCostAmbiguous === true
    || piAcp.observations?.sdkVsPiAcpMaintenanceCostAmbiguous === true;

  return processBoundaryAmbiguous || maintenanceCostAmbiguous
    ? 'REQUIRED'
    : 'NOT_REQUIRED';
}

function secondAcpApplicability({ piAcp, openCode }) {
  if (!isFinalizedDecidingEvidence(openCode)) return 'BLOCKED';

  const acpRemainsMateriallyDecisionRelevant = openCode.observations?.materialAcpBoundaryAdvantage === true;
  if (!acpRemainsMateriallyDecisionRelevant) return 'NOT_REQUIRED';
  if (!isFinalizedEvidence(piAcp)) return 'BLOCKED';

  const twoIndependentAcpImplementationsPassed = piAcp.verdict === 'PASS' && openCode.verdict === 'PASS';
  return twoIndependentAcpImplementationsPassed ? 'NOT_REQUIRED' : 'REQUIRED';
}

export function evaluateApplicability(evidence = {}) {
  return Object.freeze({
    piRpc: piRpcApplicability(evidence),
    secondAcp: secondAcpApplicability(evidence),
  });
}
