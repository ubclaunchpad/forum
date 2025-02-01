"use client";

import { userContext } from "@/contexts/userContext";
import Link from "next/link";
import { useContext, useState } from "react";
import { fetchUserData } from "./actions";

export default function Channels() {
  const [data, setData] = useState([]);
  const { user } = useContext(userContext); // Retrieve user ID from context

  const handleFetchData = async () => {
    const result = await fetchUserData(user.id);
    setData(result);
  };

  return (
    <div>
      <h1>User Data</h1>
      <button onClick={handleFetchData}>Fetch User Data</button>
      <div>
        {data.length > 0 ? (
          data.map((item, index) => (
            <Link
              key={index}
              href={{
                pathname: `test-route/${item}`,
              }}
            >
              <p key={index}>{item}</p>
            </Link>
          ))
        ) : (
          <p>No data fetched yet.</p>
        )}
      </div>
    </div>
  );
}
