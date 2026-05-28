export interface UserObj {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  updateProfile: (args: {
    displayName?: string | null;
    photoURL?: string | null;
  }) => Promise<void>;
}

export interface NweetObj {
  id: string;
  text: string;
  createdAt: number;
  creatorId: string;
  attachmentUrl: string;
  likes?: string[];
  displayName?: string | null;
  photoURL?: string | null;
}
