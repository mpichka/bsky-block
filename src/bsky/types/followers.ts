export interface Follows {
  follows: Actor[];
  subject: Subject;
  cursor: string;
}

export interface Followers {
  followers: Actor[];
  subject: Subject;
  cursor: string;
}

export interface Actor {
  did: string;
  handle: string;
  displayName: string;
  description?: string;
  avatar: string;
  indexedAt: string;
  viewer: ActorViewer;
  labels: any[];
}

export interface ActorViewer {
  muted: boolean;
  blockedBy: boolean;
  following: string;
  followedBy?: string;
}

export interface Subject {
  did: string;
  handle: string;
  displayName: string;
  description: string;
  avatar: string;
  indexedAt: string;
  viewer: SubjectViewer;
  labels: any[];
}

export interface SubjectViewer {
  muted: boolean;
  blockedBy: boolean;
}
