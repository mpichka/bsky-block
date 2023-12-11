export interface Session {
  did: string;
  didDoc: DidDoc;
  handle: string;
  email: string;
  emailConfirmed: boolean;
  accessJwt?: string;
  refreshJwt?: string;
}

export interface DidDoc {
  '@context': string[];
  id: string;
  alsoKnownAs: string[];
  verificationMethod: VerificationMethod[];
  service: Service[];
}

export interface Service {
  id: string;
  type: string;
  serviceEndpoint: string;
}

export interface VerificationMethod {
  id: string;
  type: string;
  controller: string;
  publicKeyMultibase: string;
}
