import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { LocalizedText } from '../../core/models/question.model';

@Pipe({ name: 'localizedText', standalone: true, pure: false })
export class LocalizedTextPipe implements PipeTransform {
  private transloco = inject(TranslocoService);

  transform(value: LocalizedText | undefined | null): string {
    if (!value) return '';
    const lang = this.transloco.getActiveLang() as 'de' | 'en';
    return value[lang] ?? value.de;
  }
}
