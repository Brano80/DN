# eGarant Platform & Services (Monorepo)

This repository contains the source code for the eGarant trusted services platform and its related microservices, including the MandateCheck API.

## Repository Structure

* `/server`: The main Node.js/Express/Drizzle backend server that runs *both* the eGarant platform and the MandateCheck API endpoints.
* `/apps/client`: The frontend application for the main eGarant platform (virtual offices, document signing).
* `/apps/eudi-verifier-test`: A dedicated test frontend used for prototyping and testing the MandateCheck API flow.
* `/packages`: Shared code (e.g., database schema) used by multiple services.

---

## 1. MandateCheck API (Prototype)

A B2B SaaS API for verifying corporate mandates (e.g., "is this person a CEO?") in real-time using the EUDI Wallet ecosystem.

➡️ **[Click here for the full MandateCheck API documentation and prototype guide](./MandateCheck_README.md)**

---

## 2. eGarant Platform (Core)

The main platform for trusted digital transactions, including:
* Virtual Offices for secure collaboration.
* Digital contract management.
* QES (Qualified Electronic Signature) validation.
* (Future) Escrow services.

*(Documentation for this platform is under development.)*