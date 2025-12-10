# CaesarForum

Caesar Forum is onze plek om evenementsdatums aan te maken, en vervolgens voor alle beschikbare ruimtes sessies in te plannen. Zo houden we de Forum-dagen overzichtelijk!

Dit project is gegenereerd met [Angular CLI](https://github.com/angular/angular-cli) versie 20.3.7.

## Icons

Voor icons gebruiken we: [Mage Icons](https://mageicons.com/)

## Backend & Database

Dit project gebruikt [PocketBase](https://pocketbase.io/) als backend en database. De PocketBase instance draait op [Pockethost](https://pockethost.io/): https://caesar-forum.pockethost.io

## Authenticatie

De applicatie ondersteunt authenticatie via:

- **Microsoft Login**: OAuth2 authenticatie met een losse Entra ID Tenant
- Standaard email/wachtwoord login

## Development server

Om een lokale development server te starten, voer uit:

```bash
ng serve
```

Zodra de server draait, open je browser en navigeer naar `http://localhost:4200/`. De applicatie zal automatisch herladen wanneer je een van de bronbestanden wijzigt.

## Code scaffolding

Angular CLI bevat krachtige code scaffolding tools. Om een nieuwe component te genereren, voer uit:

```bash
ng generate component component-name
```

Voor een complete lijst van beschikbare schematics (zoals `components`, `directives`, of `pipes`), voer uit:

```bash
ng generate --help
```

## Building

Om het project te bouwen, voer uit:

```bash
ng build
```

Dit compileert je project en slaat de build artifacts op in de `dist/` directory. Standaard optimaliseert de productie build je applicatie voor prestaties en snelheid.

## Unit tests uitvoeren

Om unit tests uit te voeren met de [Karma](https://karma-runner.github.io) test runner, gebruik het volgende commando:

```bash
ng test
```

## End-to-end tests uitvoeren

Voor end-to-end (e2e) testing, voer uit:

```bash
ng e2e
```

Angular CLI komt standaard niet met een end-to-end testing framework. Je kunt er een kiezen die bij je behoeften past.

## Aanvullende bronnen

Voor meer informatie over het gebruik van Angular CLI, inclusief gedetailleerde commandoreferenties, bezoek de [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) pagina.
