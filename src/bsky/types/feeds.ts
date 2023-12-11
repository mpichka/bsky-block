export interface Author {
  did: string;
  handle: string;
  displayName: string;
  avatar: string;
  viewer: PostViewer;
  labels: string[];
}

export interface Image {
  thumb: string;
  fullsize: string;
  alt: string;
  aspectRatio: {
    width: number;
    height: number;
  };
}

export interface RecordEmbed {
  $type: string;
  media: {
    $type: string;
    images: Image[];
  };
  record: {
    $type: string;
    record: {
      cid: string;
      uri: string;
    };
  };
}

export interface PostRecord {
  text: string;
  $type: string;
  embed: RecordEmbed;
  langs: string[];
  createdAt: string;
}

export interface Post {
  uri: string;
  cid: string;
  author: Author;
  record: PostRecord;
  embed: {
    $type: string;
    images: Image[];
  };
  replyCount: number;
  repostCount: number;
  likeCount: number;
  indexedAt: string;
  viewer: PostViewer;
  labels: string[];
}

export interface PostViewer {
  muted: boolean;
  blockedBy: boolean;
  following?: string;
  followedBy?: string;
  repost?: string;
  like?: string;
}

export interface FeedItem {
  post: Post;
}

export interface Feeds {
  feed: FeedItem[];
}
