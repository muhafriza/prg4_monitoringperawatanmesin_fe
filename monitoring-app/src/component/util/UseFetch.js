import Cookies from "js-cookie";
import { decryptId } from "./Encryptor";

const fetchData = async (url, param = {}, method = "POST") => {
  let activeUser = "";
  let response;
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;

  try {
    if (method === "POST") {
      let paramToSent = {
        ...param,
        activeUser: activeUser === "" ? undefined : activeUser,
      };
      response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(paramToSent),
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("jwtToken"),
        },
      });
    } else if (method === "GET") {
      response = await fetch(url);
    }

    const result = await response.json();
    if (response.ok) {
      return result;
    } else {
      return "ERROR";
    }
  } catch (err) {
    return "ERROR";
  }
};

export default fetchData;
