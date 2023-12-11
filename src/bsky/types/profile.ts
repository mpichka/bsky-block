export interface Profile {
  did: string;
  handle: string;
  displayName: string;
  description: string;
  avatar: string;
  banner: string;
  followsCount: number;
  followersCount: number;
  postsCount: number;
  indexedAt: string;
  viewer: Viewer;
  labels: any[];
}

export interface Viewer {
  muted: boolean;
  blockedBy: boolean;
}
