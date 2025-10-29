"use client";
import React, { useState, useEffect } from "react";
import ExperienceDetails from "../components/details.tsx/page";
import {Experience} from "../../types/index";
import Image from "next/image";
const ExperienceBookingHome: React.FC = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [filteredExperiences, setFilteredExperiences] = useState<Experience[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
   const [selectedExperienceId, setSelectedExperienceId] = useState<string | null>(null);

  const handleViewDetails = (id: string) => {
    setSelectedExperienceId(id);
  };

  const handleBack = () => {
    setSelectedExperienceId(null);
  };
  useEffect(() => {
    const fetchExperiences = async (): Promise<void> => {
      setLoading(true);
      try {
        const response = await fetch('/api/experiences');
        if (!response.ok) {
          throw new Error('Failed to fetch experiences');
        }
        const data: Experience[] = await response.json();
        setExperiences(data);
        setFilteredExperiences(data);
      } catch (error) {
        console.error('Error fetching experiences:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchExperiences();
  }, []);

  const handleSearch = (query: string): void => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredExperiences(experiences);
    } else {
      const filtered = experiences.filter((exp) =>
        exp.title.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredExperiences(filtered);
    }
  };
 

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#F9F9F9] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Image
                      className="h-55px w-auto"
                      src="/logo.svg"
                      alt="HDBookings logo"
                      width={100}
                      height={20}
                      priority
                    />
          </div>
          <div className="flex-1 max-w-2xl mx-8">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="text"
                placeholder="Search experiences"
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
                className="w-full px-4 py-2 pr-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
              <button className="  h-[42px] px-5 py-2  rounded-lg bg-yellow-400 hover:bg-yellow-500 rounded-r-lg font-medium transition-colors  sm:w-auto w-full">
                Search
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 text-lg">Error: {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-6 py-2 bg-yellow-400 hover:bg-yellow-500 rounded-lg font-medium"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {filteredExperiences.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No experiences found matching "{searchQuery}"</p>
              </div>
            ) :<>{selectedExperienceId ? (
        <ExperienceDetails experienceId={selectedExperienceId} onBack={handleBack} />
      ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredExperiences.map((exp) => (
                  <div
                    key={exp.id}
                    className="bg-[#F0F0F0] rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
                  >
                    <div className="relative h-48">
                      <img
                        src={exp.imageUrl!}
                        alt={exp.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{exp.title}</h3>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {exp.location}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {exp.details || exp.about !}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-medium text-gray-900">
                          From ₹{exp.price}
                        </div>
                        <button className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded transition-colors"
                       onClick={() => handleViewDetails(exp.id)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            </>}
          </>
        )}
      </main>
    </div>
  );
};

export default ExperienceBookingHome;