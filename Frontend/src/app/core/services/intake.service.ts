import { Injectable, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { PortalApi } from '../api/portal.api';
import { InstitutionService } from './institution.service';
import { IntakePayload, IntakeRecord, IntakeSubmitResult } from '../models/intake.model';

const STORAGE_KEY = 'iespp-intake-records';

@Injectable({
  providedIn: 'root',
})
export class IntakeService {
  private readonly institution = inject(InstitutionService);
  private readonly api = inject(PortalApi);
  private readonly records = signal<IntakeRecord[]>(this.readStore());

  async submit(payload: IntakePayload, file?: File | null): Promise<IntakeSubmitResult> {
    if (environment.useRemoteApi) {
      return this.api.mesaPartes(payload, file);
    }

    const trackingCode = this.createTrackingCode();
    const record: IntakeRecord = {
      trackingCode,
      submittedAt: new Date().toISOString(),
      status: 'recibido',
      payload,
    };
    const next = [record, ...this.records()];
    this.records.set(next);
    this.writeStore(next);

    const info = this.institution.info();
    return {
      trackingCode,
      emailAdmin: info.contact.emailAdmin,
      emailIntake: info.contact.emailIntake,
      futUrl: 'https://goo.su/58tk5',
    };
  }

  track(code: string): IntakeRecord | undefined {
    if (environment.useRemoteApi) {
      return undefined;
    }
    const normalized = code.trim().toUpperCase();
    return this.records().find((record) => record.trackingCode === normalized);
  }

  async trackRemote(code: string): Promise<IntakeRecord | undefined> {
    if (!environment.useRemoteApi) {
      return this.track(code);
    }
    try {
      return await this.api.rastrearMesa(code);
    } catch {
      return undefined;
    }
  }

  private createTrackingCode(): string {
    const stamp = Date.now().toString(36).toUpperCase().slice(-6);
    const rand = Math.floor(100 + Math.random() * 900);
    return `MDP-${stamp}${rand}`;
  }

  private readStore(): IntakeRecord[] {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as IntakeRecord[]) : [];
    } catch {
      return [];
    }
  }

  private writeStore(records: IntakeRecord[]): void {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch {
      // El registro queda en memoria de la sesión aunque el storage falle.
    }
  }
}
