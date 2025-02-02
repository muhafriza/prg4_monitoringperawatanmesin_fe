import BerandaAdministrator from "./Administrator";
import BerandaTeknisi from "./Teknisi";
import Cookies from "js-cookie";
import { decryptId } from "../../util/Encryptor";
import BerandaPIC from "./Pic";

export default function Beranda() {
  const getUserInfo = () => {
    const encryptedUser = Cookies.get("activeUser");
    if (encryptedUser) {
      try {
        const userInfo = JSON.parse(decryptId(encryptedUser));
        return userInfo;
      } catch (error) {
        console.error("Failed to decrypt user info:", error);
        return null;
      }
    }
    return null;
  };

  const userInfo = getUserInfo();
  console.log(userInfo);

  const peran = userInfo.peran;

  if (!userInfo) {
    return (
      <div>
        <p>Anda belum login. Silakan login terlebih dahulu.</p>
      </div>
    );
  }

  if (peran.includes("ADMINISTRATOR")) {
    return (
      <div>
        <BerandaAdministrator />
      </div>
    );
  }
  if(peran.includes("TEKNISI")){
    return (
      <div>
        <BerandaTeknisi />
      </div>
    );
  }
  if(peran.includes("PIC")){
    return (
      <div>
        <BerandaPIC />
      </div>
    );
  }

  
  return (
    <div>
      <h1>Akses Ditolak</h1>
      <p>Anda tidak memiliki izin untuk mengakses halaman ini.</p>
    </div>
  );
}
