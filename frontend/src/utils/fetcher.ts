"use client"

import useSWR from 'swr'

import { useContext, useEffect, useState } from 'react'
import { userContext } from '@/providers/userContext';
import { z, ZodSchema } from 'zod';

type FetcherParams = Parameters<typeof fetch>

// type Fetcher = (...args: FetcherParams) => Promise<Response>

type FetcherOptions<T extends z.ZodType> = {
    returnSchema: T
}

export function useFetcher<T extends z.ZodType>({fetchParams, options}: {fetchParams: FetcherParams, options: FetcherOptions<T>}) {
  const [validatedData, setValidatedData] = useState<z.infer<T> | undefined>(undefined)
  const [error, setError] = useState<Error | undefined>(undefined)
  const { token } = useContext(userContext);
  const fetcher = async (url: string, ...args: FetcherParams) => {
    if (!token) {
        throw new Error("No token found - useFetcher must be used within a UserContextProvider")
    }
    const res = await fetch(url, {
      ...args,
      headers: {
        ...args[1]?.headers,
        Authorization: `Bearer ${token}`,
      },
    });
    return res.json();
  };
  const { data, error: fetchError, isLoading } = useSWR(fetchParams[0], fetcher);

  useEffect(() => {
    if (data) {
        const parsedData = options.returnSchema.safeParse(data)
        if (parsedData.success) {
            setValidatedData(parsedData.data)
        } else {
            // console.log("error", parsedData.error)
            console.log("Investigate why expected data for", fetchParams[0], "is not valid")
            setValidatedData(data)
            // setError(parsedData.error)
        }
    }
  }, [data])

//   useEffect(() => {
//     if (fetchError) {
//         setError(fetchError)
//     }
//   }, [fetchError])

  return { data: validatedData, error, isLoading }
}

