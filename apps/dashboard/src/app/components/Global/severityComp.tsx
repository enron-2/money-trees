export function severityComp(a: any, b: any) {
  if (!a.worstSeverity && !b.worstSeverity) {
    return 0;
  } else if (!a.worstSeverity) {
    return 1;
  } else if (!b.worstSeverity) {
    return -1;
  } else if (a.worstSeverity < b.worstSeverity) {
    return 1;
  } else if (a.worstSeverity > b.worstSeverity) {
    return -1;
  } else {
    return 0;
  }
}
