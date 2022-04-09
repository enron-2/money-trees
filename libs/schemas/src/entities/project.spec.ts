import { EntityType } from './entity';
import { ProjectEntity } from './project';

describe('Project entity loader', () => {
  it('should load', () => {
    const entity = ProjectEntity.fromDocument({
      name: 'hello/world',
      type: EntityType.Project,
      url: 'https://github.com/hello/world',
    });
    expect(entity).toBeDefined();
    expect(entity.toPlain()).toEqual({
      id: 'PRJ#hello/world',
      name: 'hello/world',
      url: 'https://github.com/hello/world',
    });
  });

  it('should not load with incorrect key', () => {
    const entity = () =>
      ProjectEntity.fromDocument({
        sk: 'oh no',
        name: 'hello/world',
        type: EntityType.Project,
        url: 'https://github.com/hello/world',
      });
    expect(entity).toThrowError();
  });
});
