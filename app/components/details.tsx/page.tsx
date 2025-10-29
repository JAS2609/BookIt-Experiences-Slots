"use client";
import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

import { Experience, ExperienceDate, ExperienceSlot } from '../../../types/index';

interface CheckoutProps {
  experienceTitle: string;
  selectedDate: string;
  selectedTime: string;
  quantity: number;
  subtotal: number;
  taxes: number;
  total: number;
  slotId: string;
  onBack?: () => void;
  onSuccess?: (bookingId: string) => void;
}


interface ExperienceDetailsProps {
  experienceId: string;
  onBack?: () => void;
}

const ExperienceDetails: React.FC<ExperienceDetailsProps> = ({ experienceId, onBack }) => {
  const [experience, setExperience] = useState<Experience | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDateId, setSelectedDateId] = useState<string>('');
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [showCheckout, setShowCheckout] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [bookingId, setBookingId] = useState<string>('');

  useEffect(() => {
    const fetchExperience = async (): Promise<void> => {
      setLoading(true);
      try {
        const response = await fetch(`/api/experiences/${experienceId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch experience details');
        }
        const data: Experience = await response.json();
        setExperience(data);
        
        if (data.dates && data.dates.length > 0) {
          const activeDate = data.dates.find(d => d.isActive);
          if (activeDate) {
            setSelectedDateId(activeDate.id);
            if (activeDate.timeSlots && activeDate.timeSlots.length > 0) {
              const availableSlot = activeDate.timeSlots.find(s => s.isAvailable);
              if (availableSlot) {
                setSelectedSlotId(availableSlot.id);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching experience:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchExperience();
  }, [experienceId]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (timeString: string): string => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-IN', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getSelectedDate = (): ExperienceDate | undefined => {
    return experience?.dates.find(d => d.id === selectedDateId);
  };

  const getSelectedSlot = (): ExperienceSlot | undefined => {
    const date = getSelectedDate();
    return date?.timeSlots.find(s => s.id === selectedSlotId);
  };

  const getAvailableCapacity = (): number => {
    const slot = getSelectedSlot();
    if (!slot) return 0;
    return slot.capacity - slot.bookedCount;
  };

  const calculateTotal = (): number => {
    if (!experience) return 0;
    const subtotal = experience.price * quantity;
    const taxes = subtotal * 0.05;
    return Math.round(subtotal + taxes);
  };

  const handleQuantityChange = (quant: number): void => {
    const availableCapacity = getAvailableCapacity();
    setQuantity(prev => Math.max(1, Math.min(prev + quant, availableCapacity)));
  };

  const handleDateChange = (dateId: string): void => {
    setSelectedDateId(dateId);
    const date = experience?.dates.find(d => d.id === dateId);
    if (date && date.timeSlots.length > 0) {
      const availableSlot = date.timeSlots.find(s => s.isAvailable);
      if (availableSlot) {
        setSelectedSlotId(availableSlot.id);
      } else {
        setSelectedSlotId(date.timeSlots[0].id);
      }
    }
    setQuantity(1);
  };

  const handleConfirm = (): void => {
    setShowCheckout(true);
  };

  const handleCheckoutBack = (): void => {
    setShowCheckout(false);
  };

  const handleBookingSuccess = (id: string): void => {
    setBookingId(id);
    setShowCheckout(false);
    setShowConfirmation(true);
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  if (error || !experience) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">Error: {error || 'Experience not found'}</p>
          <button 
            onClick={onBack}
            className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 rounded-lg font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (showConfirmation) {
    return <BookingConfirmation bookingId={bookingId} />;
  }

  if (showCheckout) {
    const selectedDate = getSelectedDate();
    const selectedSlot = getSelectedSlot();
    const subtotal = experience.price * quantity;
    const taxes = Math.round(subtotal * 0.05);

    return (
      <Checkout
        experienceTitle={experience.title}
        selectedDate={formatDate(selectedDate?.date || '')}
        selectedTime={formatTime(selectedSlot?.startTime || '')}
        quantity={quantity}
        subtotal={subtotal}
        taxes={taxes}
        total={calculateTotal()}
        slotId={selectedSlotId}
        onBack={handleCheckoutBack}
        onSuccess={handleBookingSuccess}
      />
    );
  }

  const subtotal = experience.price * quantity;
  const taxes = Math.round(subtotal * 0.05);
  const activeDates = experience.dates.filter(d => d.isActive);
  const selectedDate = getSelectedDate();
  const availableSlots = selectedDate?.timeSlots.filter(s => s.isAvailable) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button 
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="font-medium">Details</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="relative w-full h-96 rounded-lg overflow-hidden">
              <img
                src={experience.imageUrl!}
                alt={experience.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{experience.title}</h1>
              <p className="text-gray-600 leading-relaxed">
                {experience.details || 'Curated small-group experience. Certified guide. Safety first with gear included.'}
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Choose date</h2>
              {activeDates.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {activeDates.map((date) => (
                    <button
                      key={date.id}
                      onClick={() => handleDateChange(date.id)}
                      className={`px-4 py-2 rounded border transition-colors ${
                        selectedDateId === date.id
                          ? 'bg-yellow-400 border-yellow-400 text-black font-medium'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {formatDate(date.date)}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No dates available</p>
              )}
            </div>

            {selectedDate && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Choose time</h2>
                {availableSlots.length > 0 ? (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {availableSlots.map((slot) => {
                        const spotsLeft = slot.capacity - slot.bookedCount;
                        return (
                          <button
                            key={slot.id}
                            onClick={() => setSelectedSlotId(slot.id)}
                            disabled={spotsLeft === 0}
                            className={`px-4 py-2 rounded border transition-colors relative ${
                              selectedSlotId === slot.id
                                ? 'bg-yellow-400 border-yellow-400 text-black font-medium'
                                : spotsLeft === 0
                                ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                                : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                            }`}
                          >
                            {formatTime(slot.startTime)}
                            {spotsLeft > 0 && spotsLeft <= 10 && (
                              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                                {spotsLeft} left
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">All times are in IST (GMT+5:30)</p>
                  </>
                ) : (
                  <p className="text-gray-500">No time slots available for this date</p>
                )}
              </div>
            )}

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">About</h2>
              <p className="text- [#838383] bg-gray-100 p-4 rounded-lg ">
                {experience.about !}
              </p>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-[#F0F0F0] rounded-lg shadow-md p-6 sticky top-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Starts at</span>
                  <span className="font-semibold">₹{experience.price}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Quantity</span>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <span className="font-semibold w-8 text-center">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= getAvailableCapacity()}
                      className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">₹{subtotal}</span>
                </div>

                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                  <span className="text-gray-600">Taxes</span>
                  <span className="font-semibold">₹{taxes}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-gray-900">₹{calculateTotal()}</span>
                </div>

                <button
                  onClick={handleConfirm}
                  disabled={!selectedDateId || !selectedSlotId || getAvailableCapacity() === 0}
                  className="w-full py-3  text-gray-800 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed  disabled:bg-gray-300 disabled:hover:bg-gray-400 bg-yellow-400 hover:bg-yellow-500"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const Checkout: React.FC<CheckoutProps> = ({
  experienceTitle,
  selectedDate,
  selectedTime,
  quantity,
  subtotal,
  taxes,
  total,
  slotId,
  onBack,
  onSuccess
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promoDiscount, setPromoDiscount] = useState<number>(0);
  const [promoApplied, setPromoApplied] = useState<boolean>(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoError('Please enter a promo code');
      return;
    }

    setIsValidatingPromo(true);
    setPromoError(null);

    try {
      const response = await fetch(`/api/promo/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: promoCode,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.valid) {
        setPromoError(data.message || 'Invalid promo code');
        setPromoDiscount(0);
        setPromoApplied(false);
        return;
      }

      setPromoDiscount(data.discountPercentage);
      setPromoApplied(true);
      setPromoError(null);
    } catch (err) {
      setPromoError('Failed to validate promo code');
      setPromoDiscount(0);
      setPromoApplied(false);
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const calculateDiscountedTotal = () => {
    if (!promoApplied || promoDiscount === 0) {
      return total;
    }
    const discount = Math.round((subtotal * promoDiscount) / 100);
    const discountedSubtotal = subtotal - discount;
    const newTaxes = Math.round(discountedSubtotal * 0.05);
    return discountedSubtotal + newTaxes;
  };

  const getDiscountAmount = () => {
    if (!promoApplied || promoDiscount === 0) {
      return 0;
    }
    return Math.round((subtotal * promoDiscount) / 100);
  };

  const handleSubmit = async () => {
    setError(null);

    if (!agreeTerms) {
      setError('Please agree to the terms and safety policy');
      return;
    }

    if (!fullName.trim() || !email.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: fullName,
          email: email,
          slotId: slotId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking');
      }

      if (onSuccess && data.bookingId) {
        onSuccess(data.bookingId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button 
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="font-medium">Checkout</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="space-y-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                    Full name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="test@test.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="promoCode" className="block text-sm font-medium text-gray-700 mb-2">
                    Promo code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="promoCode"
                      value={promoCode}
                      onChange={(e) => {
                        setPromoCode(e.target.value);
                        setPromoError(null);
                      }}
                      disabled={promoApplied}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-all disabled:bg-gray-100"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      disabled={isValidatingPromo || promoApplied}
                      className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isValidatingPromo ? 'Checking...' : promoApplied ? 'Applied' : 'Apply'}
                    </button>
                  </div>
                  {promoError && (
                    <p className="text-red-500 text-sm mt-1">{promoError}</p>
                  )}
                  {promoApplied && (
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-green-600 text-sm font-medium">
                        Promo code applied! {promoDiscount}% off
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setPromoApplied(false);
                          setPromoDiscount(0);
                          setPromoCode('');
                        }}
                        className="text-red-500 text-sm hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="agreeTerms"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 text-yellow-400 border-gray-300 rounded focus:ring-yellow-400"
                  />
                  <label htmlFor="agreeTerms" className="ml-2 text-sm text-gray-600 cursor-pointer">
                    I agree to the terms and safety policy
                  </label>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-[#F0F0F0] rounded-lg shadow-sm p-6 sticky top-8">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between pt-3">
                  <span className="text-gray-600">Experience</span>
                  <p className="font-medium text-gray-900">{experienceTitle}</p>
                </div>

                <div className="flex justify-between pt-3">
                  <span className="text-gray-600">Date</span>
                  <p className="font-medium text-gray-900">{selectedDate}</p>
                </div>

                <div className="flex justify-between pt-3">
                  <span className="text-gray-600">Time</span>
                  <p className="font-medium text-gray-900">{selectedTime}</p>
                </div>

                <div className="flex justify-between pt-3">
                  <span className="text-gray-600">Qty</span>
                  <p className="font-medium text-gray-900">{quantity}</p>
                </div>

                <div className="flex justify-between pt-3">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">₹{subtotal}</span>
                </div>

                {promoApplied && promoDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({promoDiscount}%)</span>
                    <span className="font-medium">-₹{getDiscountAmount()}</span>
                  </div>
                )}

                <div className="flex justify-between pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Taxes</span>
                  <span className="font-medium text-gray-900">₹{promoApplied ? Math.round((subtotal - getDiscountAmount()) * 0.05) : taxes}</span>
                </div>

                <div className="flex justify-between pt-3">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-gray-900">₹{calculateDiscountedTotal()}</span>
                </div>
                
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !agreeTerms}
                  className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-yellow-400"
                >
                  {isSubmitting ? 'Processing...' : 'Pay and Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const BookingConfirmation: React.FC<{ bookingId: string }> = ({ bookingId }) => {
  const handleGoHome = () => {
    window.location.href = '/home';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
        <p className="text-gray-600 mb-4">
          Your booking ID is: <span className="font-mono font-semibold">{bookingId}</span>
        </p>
        <p className="text-sm text-gray-500 mb-6">
          A confirmation email has been sent to your email address.
        </p>
        <button
          onClick={handleGoHome}
          className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg transition-colors"
        >
          Go Back to Home
        </button>
      </div>
    </div>
  );
};
export default ExperienceDetails;
