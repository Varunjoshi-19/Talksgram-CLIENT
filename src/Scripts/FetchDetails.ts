import { MAIN_BACKEND_URL } from "./URL";


const URL = `${MAIN_BACKEND_URL}/accounts/fetchProfileDetails`;

export async function fetchProfileDetails(id = "") {

    let user;
    let userId;

    if (id != "") {
        userId = id;
    } else {

        user = localStorage.getItem("user-token");
        if (user) {

            const parsedUser = JSON.parse(user);
            userId = parsedUser.id;
        }

    }

    console.log(userId);

    const response = await fetch(`${URL}/${userId}`, { method: "POST" });
    const result = await response.json();

    if (response.ok) {
        const profile = result.userProfile;
        return profile;
    }
    if (!response.ok) {
        return null;
    }


}


export async function fetchOtherUserDetails(id: string) {

    const response = await fetch(`${MAIN_BACKEND_URL}/accounts/fetchOtherUser/${id}`, { method: "POST" });
    const result = await response.json();

    if (response.ok) {
        const profile = result.userProfile;
        return profile;
    }
    if (!response.ok) {
        return null;
    }

}

export async function GenerateId(combinedString: string) {

    const response = await fetch(`${MAIN_BACKEND_URL}/Personal-chat/generate-chatId/${combinedString}`);
    const result = await response.json();

    if (response.ok) {
        const chatId = result.chatId;

        return chatId;
    }
    if (!response.ok) {
        return new Error("error generating chat id");
    }

}

export async function fetchChattedUserDetails(id: string) {

    const response = await fetch(`${MAIN_BACKEND_URL}/Personal-chat/fetch-chatted-users/${id}`, { method: "POST" });

    const result = await response.json();

    if (response.ok) {

        return result.users;
    }

    if (!response.ok) {
        console.log("no users")
        return;
    }
}

export async function fetchSearchUser(searchValue: string) {

    const response = await fetch(`${MAIN_BACKEND_URL}/accounts/searchUser/?username=${searchValue}`, {
        method: "POST"
    });

    const result = await response.json();

    if (response.ok) {

        console.log(result.searchedAccounts);
        return result.searchedAccounts;

    }
    if (!response.ok) {

        return null;
    }


}

export async function fetchCommunicationID(userId: string) {

    if (userId == "") return;


    const response = await fetch(`${MAIN_BACKEND_URL}/accounts/communication-id/${userId}`, { method: "POST" });

    const result = await response.json();

    if (response.ok) {
        return result.commId;
    }
    if (!response.ok) {
        return null;
    }

}

export async function fetchAllData(id: string) {

    let senderDetails;
    let receiverDetails;
    let chatId;

    try {
        const [myDetails, otherDetailsResponse] = await Promise.all([
            fetchProfileDetails(),
            fetch(`${MAIN_BACKEND_URL}/Personal-chat/fetchUser/${id}`)

        ]);

        const otherDetails = await otherDetailsResponse.json();


        if (otherDetailsResponse.ok) {
            senderDetails = myDetails;
            receiverDetails = otherDetails.userProfile;
        } else {
            return { success: false };
        }

        const otherProfileId = otherDetails.userProfile?._id;
        const sortedUsers = [myDetails?._id, otherProfileId].sort();
        const combinedString = `${sortedUsers[0]}_${sortedUsers[1]}`
        const generatedId = await GenerateId(combinedString);
        chatId = generatedId;

        return { senderDetails, receiverDetails, chatId, success: true };

    } catch (error) {
        console.error("Error fetching data:", error);
        return { error, success: false }

    }
}

export async function fetchDetailsOfUserPost(id: string) {
    let post = null;
    try {

        const response = await fetch(`${MAIN_BACKEND_URL}/uploadPost/fetch-single-post/${id}`);
        const result = await response.json();
        if (response.ok) {
            post = result.post;
            return post;
        }
        if (!response.ok) {
            return post;
        }

    }
    catch (error) {
        console.log(error);
        return post;
    }

}

export async function fetchUserOnlineStatus(id: string) {
    try {
        const response = await fetch(`${MAIN_BACKEND_URL}/accounts/user-online-status/${id}`);
        const result = await response.json();
        console.log(result);
        if (response.ok) return result.onlineStatus;
        if (!response.ok) return result.onlineStatus;
    }
    catch (error) {
        return false;
    }
}