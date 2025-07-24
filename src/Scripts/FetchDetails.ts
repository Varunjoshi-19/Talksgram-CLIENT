import { MAIN_BACKEND_URL } from "./URL";



export async function GetIdAndUsername(id: string) {

    try {
        const response = await fetch(`${MAIN_BACKEND_URL}/accounts/getIdAndUsername/${id}`);
        const result = await response.json();
        if (response.ok) return result;
    } catch (error) {
        return false;
    }


}

export async function fetchProfileDetails(id : string) { 
    try {
      const response = await fetch(`${MAIN_BACKEND_URL}/accounts/fetch-profile-details/${id}`);
      const result = await response.json();
      return result;         
    }catch(error) {
        return false;
    }

}


export async function updateLocalStorageData(id : string) {
    const profile = await fetchProfileDetails(id); 
    localStorage.setItem("profile-details" , JSON.stringify(profile));
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
        const userMap = new Map(result);
        return userMap;
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

export async function fetchAllData(profile: any, id: string) {

    let receiverDetails;
    let chatId;

    try {

        const otherDetailsResponse = await fetch(`${MAIN_BACKEND_URL}/Personal-chat/fetchUser/${id}`)

        const otherDetails = await otherDetailsResponse.json();


        if (otherDetailsResponse.ok) {
            receiverDetails = otherDetails;
        } else {
            return { success: false };
        }

        const otherProfileId = otherDetails._id;
        const sortedUsers = [profile?._id, otherProfileId].sort();
        const combinedString = `${sortedUsers[0]}_${sortedUsers[1]}`;
        const generatedId = await GenerateId(combinedString);
        chatId = generatedId;

        return { receiverDetails, chatId, success: true };

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

export async function seenAllChats(senderId: string, receiverId: string) {
    console.log("seen chat fired");
    const response = await fetch(`${MAIN_BACKEND_URL}/Personal-chat/seen-chats/${senderId}/${receiverId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }
    });

    const result = await response.json();
    if (response.ok) console.log(result);


    return;
}


export async function fetchProfileLocalStorage(): Promise<any> {
    const profile = localStorage.getItem("profile-details");
    if (!profile) throw new Error("No profile exists!");

    const parsedProfile = JSON.parse(profile);
    console.log(parsedProfile._id);
    return parsedProfile;
}