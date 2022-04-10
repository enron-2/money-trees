import { VulnEntity } from './vuln';
describe('Vuln entity loader', () => {
  it('should load', () => {
    const entity = VulnEntity.fromDocument({
      type: 'Vuln',
      name: 'CVE-111',
      severity: 5,
    });
    expect(entity).toBeDefined();
    expect(entity.id).toBe(`VLN#${String.fromCodePoint(5)}#CVE-111`);
  });

  it('should transform severity to int', () => {
    const entity = VulnEntity.fromDocument({
      type: 'Vuln',
      name: 'CVE-111',
      severity: '6' as any,
    });
    expect(entity).toBeDefined();
    expect(entity.severity).toBe(6);
  });

  it('should throw error with empty string description', () => {
    const entity = () =>
      VulnEntity.fromDocument({
        type: 'Vuln',
        name: 'CVE-111',
        severity: 5,
        description: '',
      });
    expect(entity).toThrowError();
  });

  it('should throw error with invalid severity values', () => {
    const entity = (severity: number) => () =>
      VulnEntity.fromDocument({
        type: 'Vuln',
        name: 'CVE-111',
        severity,
      });
    expect(entity(3.1412)).toThrowError();
    expect(entity(0)).toThrowError();
    expect(entity(11)).toThrowError();
    expect(entity('not a number' as any)).toThrowError();
  });
});
