import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { MenuStore } from './menu.store';
import { PortalApi } from '../api/portal.api';
import { NAVIGATION, type MenuItem } from '../constants/navigation.constant';

/**
 * El menú se pinta en todas las páginas del portal. Si se queda vacío no falla
 * una sección: falla el sitio entero. Estas pruebas fijan esa garantía.
 */
describe('MenuStore', () => {
  let api: { menu: ReturnType<typeof vi.fn> };

  const crear = (respuesta: unknown, falla = false): MenuStore => {
    api = { menu: vi.fn(falla ? () => Promise.reject(new Error('API caída')) : async () => respuesta) };
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), MenuStore, { provide: PortalApi, useValue: api }],
    });
    return TestBed.inject(MenuStore);
  };

  afterEach(() => TestBed.resetTestingModule());

  it('arranca con el menú oficial antes de hablar con el API', () => {
    const store = crear({});
    expect(store.principal().length).toBeGreaterThan(0);
    expect(store.principal()[0].etiqueta).toBe('Inicio');
    expect(store.acciones().length).toBe(2);
  });

  it('conserva el menú oficial si el API no responde', async () => {
    const store = crear(null, true);
    await store.hidratar();
    expect(store.principal().length).toBe(
      NAVIGATION.filter((i) => i.zona === 'principal').length,
    );
  });

  it('conserva el menú oficial si el API devuelve zonas vacías', async () => {
    const store = crear({ principal: [], acciones: [] });
    await store.hidratar();
    expect(store.principal().length).toBeGreaterThan(0);
  });

  it('sustituye una zona con lo que manda el API', async () => {
    const nuevo: MenuItem[] = [
      { id: 'principal-a', zona: 'principal', etiqueta: 'Alfa', destino: '/alfa', orden: 1, visible: true },
    ];
    const store = crear({ principal: nuevo });
    await store.hidratar();
    expect(store.principal().map((i) => i.etiqueta)).toEqual(['Alfa']);
    // Una zona que el API no mandó no se pierde.
    expect(store.acciones().length).toBe(2);
  });

  it('ordena por `orden` y descarta los ocultos', async () => {
    const store = crear({
      principal: [
        { id: 'b', zona: 'principal', etiqueta: 'Segundo', destino: '/b', orden: 2, visible: true },
        { id: 'c', zona: 'principal', etiqueta: 'Oculto', destino: '/c', orden: 3, visible: false },
        { id: 'a', zona: 'principal', etiqueta: 'Primero', destino: '/a', orden: 1, visible: true },
      ] satisfies MenuItem[],
    });
    await store.hidratar();
    expect(store.principal().map((i) => i.etiqueta)).toEqual(['Primero', 'Segundo']);
  });

  it('reconoce los destinos externos', () => {
    const store = crear({});
    expect(store.esExterno('https://minedu.gob.pe')).toBe(true);
    expect(store.esExterno('/nosotros')).toBe(false);
  });
});
