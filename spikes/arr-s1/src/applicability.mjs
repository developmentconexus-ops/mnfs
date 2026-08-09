const DECIDING_VERDICTS = new Set(['PASS', 'FAIL']);

export const APPLICABILITY_STATES = Object.freeze([
  'REQUIRED',
  'NOT_REQUIRED',
  'BLOCKED',
]);

function isFinalizedDecidingEvidence(evidence) {
  return evidence?.finalized === true && DECIDING_VERDICTS.has(evidence.verdict);
}

function piRpcApplicability({ piSdk, piAcp }) {
  if (!isFinalizedDecidingEvidence(piSdk) || !isFinalizedDecidingEvidence(piAcp)) return 'BLOCKED';

  const sdkBoundaryRequired = piSdk.verdict === 'FAIL'
    && piSdk.triggers?.failedSolelyBecauseOutOfProcessBoundaryRequired === true;
  const acpTranslationIsolationRequired = piAcp.verdict === 'FAIL'
    && piAcp.triggers?.failedAndRequiresPiRpcIsolation === true;
  const processBoundaryAmbiguous = piSdk.observations?.sdkVsPiAcpProcessBoundaryAmbiguous === true
    || piAcp.observations?.sdkVsPiAcpProcessBoundaryAmbiguous === true;

  return sdkBoundaryRequired || acpTranslationIsolationRequired || processBoundaryAmbiguous
    ? 'REQUIRED'
    : 'NOT_REQUIRED';
}

function secondAcpApplicability({ piAcp, openCode }) {
  if (!isFinalizedDecidingEvidence(piAcp) || !isFinalizedDecidingEvidence(openCode)) return 'BLOCKED';

  const twoIndependentAcpImplementationsPassed = piAcp.verdict === 'PASS' && openCode.verdict === 'PASS';
  const acpRemainsMateriallyDecisionRelevant = openCode.observations?.materialAcpBoundaryAdvantage === true;

  return acpRemainsMateriallyDecisionRelevant && !twoIndependentAcpImplementationsPassed
    ? 'REQUIRED'
    : 'NOT_REQUIRED';
}

export function evaluateApplicability(evidence = {}) {
  return Object.freeze({
    piRpc: piRpcApplicability(evidence),
    secondAcp: secondAcpApplicability(evidence),
  });
}
