import styles from "../Styling/SearchBar.module.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSearch
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { fetchSearchUser } from "../Scripts/FetchDetails";
import { useNavigate } from "react-router-dom";

import { useToogle } from "../Context/ToogleContext"
import { MAIN_BACKEND_URL } from "../Scripts/URL";
import { searchAccount } from "../Interfaces";

function SearchBar() {

    const [searchInputClicked, setSearchInputClicked] = useState<boolean>(false);
    const [searchAccounts, setSearchedAccounts] = useState<searchAccount[]>([]);
    const navigate = useNavigate();

    const { searchInput, setSearchInput, toogleVisiblility } = useToogle();


    useEffect(() => {

        async function fetchSearchedUser() {

            if (searchInput == "") {
                setSearchedAccounts([]);
                return;
            }

            const result = await fetchSearchUser(searchInput);

            if (result) {
                setSearchedAccounts(result);
            }
            if (!result) {
                setSearchedAccounts([]);
            }

        }

        fetchSearchedUser();
    }, [searchInput])


    function closeInputBar(e: React.MouseEvent) {
        e.stopPropagation();
        setSearchInputClicked(false);
        setSearchInput("");
    }


    function handleClickOnProfile(id: string) {
        toogleVisiblility(false);
        navigate(`/userProfile/${id}`);
        setSearchInput("");
        setSearchedAccounts([]);
    }

    return (

        <div style={{ gap: "30px" }} className={styles.SearchBarContainer} >

            <p id={styles.searchName} style={{ padding: "20px 20px", fontWeight: "bolder", fontSize: "1.25rem" }}>Search</p>

            <div
                onClick={() => setSearchInputClicked(true)}
                className={styles.searchBar}
            >
                {searchInputClicked ?
                    <>
                        <input
                            id={styles.inputBox}
                            type="text"
                            placeholder="Search"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />
                        <button
                            onClick={closeInputBar}  // Call closeInputBar on button click
                            style={{
                                position: "relative",
                                right: "0px",
                                borderRadius: "50%",
                                width: "15px",
                                height: "15px",
                                border: "none",
                                opacity: "0.7",
                                cursor: "pointer"
                            }}
                        >
                            x
                        </button>
                    </>
                    :
                    <>
                        <FontAwesomeIcon style={{ opacity: "0.5" }} icon={faSearch} />
                        <p style={{ opacity: "0.5" }}>Search</p>
                    </>
                }
            </div>



            <div className={styles.foundedAccounts}>

                {searchAccounts.length > 0 ?


                    searchAccounts.map((account, index) => (


                        <div onClick={() => handleClickOnProfile(account._id)} key={index} className={styles.userProfiles} >

                            <div id={styles.profilePic}>

                                <img src={`${MAIN_BACKEND_URL}/accounts/profileImage/${account._id}`} height="100%" width="100%" alt="" />
                            </div>

                            <div style={{ marginLeft: "3px", display: "flex", flexDirection: "column", justifyContent: "center" }} >
                                <p>{account.username}</p>
                                <p>{account.fullname}</p>
                            </div>

                        </div>

                    ))


                    :

                    <div>
                        <p style={{ padding: "10px 20px", fontWeight: "bolder", fontSize: "1rem" }} >Recent</p>
                    </div>


                }

            </div>



        </div>
    );
}

export default SearchBar;
