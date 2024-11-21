'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

const temp = {
    "answer": {
        "query_time": "2024-11-19 05:15:10",
        "question": "define Parenchyma",
        "answer": "### Definition of Parenchyma\n\n\nParenchyma is a type of plant tissue that is primarily involved in storage, photosynthesis, and tissue repair. It consists of living cells that have thin cell walls and can vary in shape, allowing for versatility in function. Parenchyma cells are often found in the pith of young seedlings, where they serve as a storage tissue, and are also present in other parts of the plant, including leaves and fruits, where they can store nutrients and assist in photosynthesis (Frst 303 Lecture 6, 2023).\n\nUnlike other tissue types, such as collenchyma and sclerenchyma, parenchyma cells retain the ability to divide and can become meristematic, allowing them to play roles in growth and repair (Frst 303 Lecture 6, 2023).\n\n",
        "sources_used": [
            {
                "document_title": "Frst 303 Lecture 6 2023",
                "slide_number": 47,
                "page_number": 46,
                "file_url": "https://ejemblzcjdswipxsfire.supabase.co/storage/v1/object/public/course-files/documents/Frst_303_Lecture_6_2023",
                "relevance": 0.457,
                "content": "Internal Shoot Anatomy Pith - functions as a storage tissue in the young seedling (not found in the root) epidermis phloem. nerf vascular bundle",
                "has_image_content": true
            },
            {
                "document_title": "Frst 303 Lecture 6 2023",
                "slide_number": 21,
                "page_number": 20,
                "file_url": "https://ejemblzcjdswipxsfire.supabase.co/storage/v1/object/public/course-files/documents/Frst_303_Lecture_6_2023",
                "relevance": 0.434,
                "content": "Primary Growth primary phloem - for transport of food and other biochemicals (e.g., phytohormones) vascular cambium – layer of cells found in between the xylem and phloem, inside the endodermis and pericycle It eventually expands and becomes the meristem that will produce wood",
                "has_image_content": false
            },
            {
                "document_title": "Frst 303 Lecture 6 2023",
                "slide_number": 20,
                "page_number": 19,
                "file_url": "https://ejemblzcjdswipxsfire.supabase.co/storage/v1/object/public/course-files/documents/Frst_303_Lecture_6_2023",
                "relevance": 0.434,
                "content": "Primary Growth Pericycle - similar to cortex in appearance Cell layer from which root branches originate Where certain pericycle cells later become meristematic form new apical meristems and root caps and produce lateral roots that will push their way out into the soil",
                "has_image_content": false
            },
            {
                "document_title": "Frst 303 Lecture 6 2023",
                "slide_number": 17,
                "page_number": 16,
                "file_url": "https://ejemblzcjdswipxsfire.supabase.co/storage/v1/object/public/course-files/documents/Frst_303_Lecture_6_2023",
                "relevance": 0.417,
                "content": "Primary Growth Root cross section - from the outside in, the primary tissue zone, i.e., the finished, final tissues after differentiation epidermis Cor Tex endocterm is periey cle FP sale _ prumary phloem vaseudar Cammbiaan",
                "has_image_content": true
            },
            {
                "document_title": "Frst 303 Lecture 6 2023",
                "slide_number": 77,
                "page_number": 76,
                "file_url": "https://ejemblzcjdswipxsfire.supabase.co/storage/v1/object/public/course-files/documents/Frst_303_Lecture_6_2023",
                "relevance": 0.405,
                "content": "Secondary Growth of Roots The cortex and endodermis are shed early  they split off as the root expands within The primary phloem gets pushed outwards and is crushed Outer portions of the pericycle, underneath the endodermis, also become meristematic and form a cork cambium which produces the periderm Like shoots, roots with periderms must have lenticels to allow gas movement",
                "has_image_content": false
            }
        ]
    }
}

type Source = {
  document_title: string
  slide_number: number
  page_number: number
  file_url: string
  relevance: number
  content: string
  has_image_content: boolean
}

type SearchResult = {
  query_time: string
  question: string
  answer: string
  sources_used: Source[]
}

export default function Component({setDocLink}: {setDocLink: (link: string, pageNumber: number) => void}) {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      setIsLoading(true)
      setResult(null)
      // const response = await fetch('http://localhost:8000/query', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({ question: query })
      // });

    //  const data = await response.json();
    const data = temp;
      const newResult: SearchResult = data.answer as SearchResult
      setResult(newResult)
      setIsLoading(false)
    }
  }

  return (
    <div className=" p-4  flex flex-col">
      <header className="p-4 sm:p-6 flex justify-center">
        <form onSubmit={handleSearch} className="w-full max-w-4xl flex gap-2">
          <Input 
            type="search"
            placeholder="Search for anything..." 
            value={query} 
            onChange={(e) => setQuery(e.target.value)}
            className="flex-grow border border-neutral-200 rounded-xl bg-blue-100 bg-opacity-20 text-lg py-5"
          />
          <Button type="submit" className=' px-4 bg-blue-800' size="md"  disabled={isLoading}>
            <Search className="h-6 w-6" />
            <span className="">Search</span>
          </Button>
        </form>
      </header>
      <main className="flex-grow  overflow-scroll">
        <div className="max-w-4xl ">
          {isLoading ? (
            <Card className="loading-gradient h-96 flex items-center justify-center">
              <CardContent>
                <p className="text-2xl font-bold text-gray-700 animate-pulse">Searching...</p>
              </CardContent>
            </Card>
          ) : result ? (

              <div className='flex flex-col h-full px-8'>
                <div className="prose max-w-none py-4  ">
                  <ReactMarkdown>{result.answer}</ReactMarkdown>
                </div>
                <h3 className="pt-6 pb-2 font-semibold border-t">Materials</h3>
                <ul className="space-y-2">
                  {result.sources_used.map((source, index) => (
                    <li key={index} className="text-sm py-2 border-b">
                      <Button 
                      variant={"ghost"}
                      
                      onClick={() => setDocLink(source.file_url, source.page_number)}
                       className=" hover:underline text-blue-800 px-0 underline rounded-none">
                      {index+1}.  {source.document_title}      <span> (Slide {source.slide_number}, Page {source.page_number})</span>
                      </Button>
                      <p className="mt-1 text-gray-600">{source.content}</p>
                    </li>
                  ))}
                </ul>
              </div>
          ) : null}
        </div>
      </main>
      <footer className="p-4 text-center text-gray-500">
        © 2024 ForumAI; All rights reserved.
      </footer>
    </div>
  )
}