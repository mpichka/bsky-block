import axios from 'axios';
import { Credentials } from './types/credentials';
import { Feeds } from './types/feeds';
import { Followers, Follows } from './types/followers';
import { Profile } from './types/profile';
import { Session } from './types/session';
import { CheckSession } from './utils/check_session';
import { Logger } from './utils/logger';
import { queryParams } from './utils/query_params';
import { Retry } from './utils/retry';

type BskyClientOptions = {
  logger?: boolean;
};

export class BskyClient {
  private readonly PAGINATION_LIMIT = 100;
  private credentials: Credentials | null = null;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private session: Session | null = null;
  private baseUrl: string | null = null;
  private readonly protocol = '/xrpc/';
  private readonly API: Record<string, () => string> = {
    getProfile: () => this.getUrl('app.bsky.actor.getProfile'),
    getFollowers: () => this.getUrl('app.bsky.graph.getFollowers'),
    getFollows: () => this.getUrl('app.bsky.graph.getFollows'),
    getAuthorFeed: () => this.getUrl('app.bsky.feed.getAuthorFeed'),
  };
  private logger = false;

  constructor(options?: BskyClientOptions) {
    if (!options) return;
    if (Object.hasOwnProperty.call(options, 'logger')) {
      this.logger = options.logger ?? false;
    }
  }

  setCredentials(identifier: string, password: string): BskyClient {
    this.credentials = { identifier, password };
    return this;
  }

  setSession(session: Session): BskyClient {
    this.accessToken = session.accessJwt || null;
    this.refreshToken = session.refreshJwt || null;
    this.baseUrl = session.didDoc.service[0].serviceEndpoint;
    this.session = session;
    return this;
  }

  private getRequestConfig() {
    return {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + this.accessToken,
      },
    };
  }

  private getUrl(api: string): string {
    return this.baseUrl + this.protocol + api;
  }

  async createSession(): Promise<Session> {
    if (!this.credentials?.identifier || !this.credentials?.password) {
      throw new Error('Cannot create session without credentials');
    }

    const res = await axios.post<Session>(
      'https://bsky.social/xrpc/com.atproto.server.createSession',
      {
        identifier: this.credentials.identifier,
        password: this.credentials.password,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (!res.data?.accessJwt || !res.data?.refreshJwt) {
      throw new Error('Cannot create session');
    }

    this.accessToken = res.data.accessJwt;
    this.refreshToken = res.data.refreshJwt;
    this.baseUrl = res.data.didDoc.service[0].serviceEndpoint;
    this.session = res.data;

    return res.data;
  }

  @CheckSession
  @Retry
  @Logger
  async getProfile(actor: string): Promise<Profile> {
    const res = await axios.get<Profile>(
      this.API.getProfile() + queryParams({ actor }),
      this.getRequestConfig(),
    );

    return res.data;
  }

  @CheckSession
  @Retry
  @Logger
  async getFollowers(actor: string, cursor?: string): Promise<Followers> {
    const params: any = { actor, limit: this.PAGINATION_LIMIT };
    if (cursor) params.cursor = cursor;

    const res = await axios.get(
      this.API.getFollowers() + queryParams(params),
      this.getRequestConfig(),
    );
    return res.data;
  }

  @CheckSession
  @Retry
  @Logger
  async getFollows(actor: string, cursor?: string): Promise<Follows> {
    const params: any = { actor, limit: this.PAGINATION_LIMIT };
    if (cursor) params.cursor = cursor;

    const res = await axios.get(
      this.API.getFollows() + queryParams(params),
      this.getRequestConfig(),
    );
    return res.data;
  }

  @CheckSession
  @Retry
  @Logger
  async getAuthorFeeds(actor: string, cursor?: string): Promise<Feeds> {
    const params: any = { actor, limit: this.PAGINATION_LIMIT };
    if (cursor) params.cursor = cursor;

    const res = await axios.get(
      this.API.getAuthorFeed() + queryParams(params),
      this.getRequestConfig(),
    );
    return res.data;
  }
}
