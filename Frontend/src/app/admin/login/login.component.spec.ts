import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AdminLoginComponent } from './login.component';

/**
 * El login es la única pantalla que ve alguien que aún no ha entrado: el logo
 * dice de qué institución es el panel, y el ojo evita el error más común al
 * teclear una contraseña a ciegas.
 */
describe('AdminLoginComponent', () => {
  const crear = async () => {
    await TestBed.configureTestingModule({
      imports: [AdminLoginComponent],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(AdminLoginComponent);
    await fixture.whenStable();
    return fixture;
  };

  afterEach(() => TestBed.resetTestingModule());

  it('muestra el logo del instituto', async () => {
    const fixture = await crear();
    const logo = (fixture.nativeElement as HTMLElement).querySelector<HTMLImageElement>(
      '.login__badge img',
    );
    expect(logo).toBeTruthy();
    expect(logo!.getAttribute('src')).toContain('logopc2.png');
    // El alt sale de la ficha institucional, no de un literal.
    expect(logo!.getAttribute('alt')).toContain('Peruano Canadiense');
  });

  it('la contraseña empieza oculta', async () => {
    const fixture = await crear();
    const input = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
      '.field__control input',
    );
    expect(input?.getAttribute('type')).toBe('password');
  });

  it('el ojo la muestra y la vuelve a ocultar', async () => {
    const fixture = await crear();
    const raiz = fixture.nativeElement as HTMLElement;
    const boton = raiz.querySelector<HTMLButtonElement>('.field__toggle')!;
    const tipo = () => raiz.querySelector<HTMLInputElement>('.field__control input')!.getAttribute('type');

    boton.click();
    await fixture.whenStable();
    expect(tipo()).toBe('text');

    boton.click();
    await fixture.whenStable();
    expect(tipo()).toBe('password');
  });

  it('el botón del ojo no envía el formulario', async () => {
    const fixture = await crear();
    const boton = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.field__toggle')!;
    // Dentro de un <form>, un botón sin type="button" envía: pulsar el ojo
    // intentaría iniciar sesión con el formulario a medio llenar.
    expect(boton.getAttribute('type')).toBe('button');
  });

  it('anuncia su estado a un lector de pantalla', async () => {
    const fixture = await crear();
    const raiz = fixture.nativeElement as HTMLElement;
    const boton = raiz.querySelector<HTMLButtonElement>('.field__toggle')!;
    expect(boton.getAttribute('aria-label')).toContain('Mostrar');
    expect(boton.getAttribute('aria-pressed')).toBe('false');

    boton.click();
    await fixture.whenStable();
    expect(boton.getAttribute('aria-label')).toContain('Ocultar');
    expect(boton.getAttribute('aria-pressed')).toBe('true');
  });
});
