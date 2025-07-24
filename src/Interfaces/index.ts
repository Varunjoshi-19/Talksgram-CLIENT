export interface ProfilePayload {
  _id: string,
  email : string,
  username: string,
  fullname: string,
  post: number,
  bio: string,
  followers: number,
  following: number
};

export interface AllPostsProps {

  _id: string;
  authorName: string;
  likeStatus: boolean;
  postLike: number;
  postComment: number;
  postShare: number;
  postDescription: string;
  createdAt: string,
  author: {
    userId: string;
    userAccId: string;
  }
}[];

export interface CreatePostProps {
    s: () => void;
}


export interface UserInfoProps {
  username: string,
  userId: string
}

export interface PostIdProps {

  id: string;
  toogleBox: () => void;
  userInfoF: () => UserInfoProps
  currentLikes: number;
  createdAt: string;

}

export interface CommentProps {
  userId: string | any,
  username: string | any,
  comment: string,
  time: string,
  initiateTime: number
}

export interface EditProfileProps {

    profileInfo: {
        _id: string;
        username: string;
        fullname: string;
        post: number,
        bio: string;
        followers: number;
        following: number
    };

    s: () => void;
}


export interface MenuOptionProps {

  profile: {
    _id: string,
    username: string,
    fullname: string,
    post: number,
    bio: string,
    followers: number,
    following: number
  }


}

export interface notificationPayload {

  userId: string,
  userIdOf: string,
  usernameOf: string
};

export interface NotificationProps {

    userId: string,
    userIdOf: string,
    usernameOf: string
}


export interface ProfileInfo {
    _id: string | any,
    username: string,
    fullname: string,
    post: number,
    bio: string,
    followers: number,
    following: number
};



export type RecievedReelType = {

    _id: string;
    reelLike: number;
    reelComment: number;
    reelDescription: string;
    author: {
        userId: string;
        userAccId: string;
    }


}

export type AllReelsType = {

    _id: string;
    authorName: string;
    likeStatus : boolean;
    reelLike: number;
    reelComment: number;
    reelDescription: string;
    author: {
        userId: string;
        userAccId: string;
    }
    videoRef: any;

}

export type ReelLikeAndStatus = {

    likes: number,
    likeStatus: boolean

}


export interface searchAccount {
    _id: string,
    username: string,
    fullname: string,
    followers: number,
    following: number
}



export interface ToMessageProps {

    toogleButton: () => void;
    EnableMessageTab: (value: string) => void;
}