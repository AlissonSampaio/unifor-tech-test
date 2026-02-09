# @frontend/shared

Biblioteca de utilitários compartilhados entre componentes do workspace.

## Instalação

A biblioteca já está configurada no workspace. Para usar:

```typescript
import { FormatDiaSemanaPipe, formatDiaSemana } from '@frontend/shared';
```

## Componentes

### FormatDiaSemanaPipe

Pipe standalone para formatar o enum `DiaSemana` em abreviação legível.

**Uso em templates:**

```typescript
import { FormatDiaSemanaPipe } from '@frontend/shared';

@Component({
  imports: [FormatDiaSemanaPipe],
  template: `
    <span>{{ horario.diaSemana | formatDiaSemana }}</span>
  `
})
export class MyComponent {}
```

**Mapeamento:**

| Enum | Resultado |
|------|-----------|
| `SEGUNDA` | Seg |
| `TERCA` | Ter |
| `QUARTA` | Qua |
| `QUINTA` | Qui |
| `SEXTA` | Sex |
| `SABADO` | Sáb |

### formatDiaSemana (função)

Função utilitária para uso fora de templates Angular.

```typescript
import { formatDiaSemana } from '@frontend/shared';
import { DiaSemana } from '@frontend/data-access';

const abreviacao = formatDiaSemana(DiaSemana.SEGUNDA); // 'Seg'
```

## Testes

```bash
npx nx test shared
```
