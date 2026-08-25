"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Star, MessageSquarePlus, Loader2 } from "lucide-react";
import { Button } from "@/components/base/buttons/button";
import { RiMessage2Line } from "@remixicon/react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useRouter } from "next/navigation";
import { createReview, getVenueReviews } from "@/lib/actions/review";

type InitialReview = {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: Date | string;
    user: { id: string; name: string | null; image: string | null };
};

interface ReviewsSectionProps {
    venueId: string;
    initialAverageRating?: string | number | null;
    initialReviewCount?: number | null;
    initialReviews?: InitialReview[];
}

const StarsDisplay: React.FC<{ rating: number; size?: number; className?: string }> = ({ rating, size = 16, className }) => {
    const fullStars = Math.round(rating);
    const emptyStars = Math.max(0, 5 - fullStars);

    return (
        <div className={`flex items-center gap-0.5 ${className ?? ""}`}>
            {Array.from({ length: fullStars }).map((_, i) => (
                <Star key={`full-${i}`} size={size} className="fill-yellow-400 text-yellow-400 drop-shadow-sm" />
            ))}
            {Array.from({ length: emptyStars }).map((_, i) => (
                <Star key={`empty-${i}`} size={size} className="text-muted-foreground/30" />
            ))}
        </div>
    );
};

const ReviewItem: React.FC<{ review: InitialReview }> = ({ review }) => {
    const displayDate = useMemo(() => {
        try {
            const d = typeof review.createdAt === "string" ? new Date(review.createdAt) : review.createdAt;
            return format(d, "MMM dd, yyyy");
        } catch {
            return "";
        }
    }, [review.createdAt]);

    const initials = (review.user?.name || "?")
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <Card className="rounded-3xl border-border/60 shadow-xs p-0">
            <CardContent className="p-6">
                <div className="flex items-start gap-3.5">
                    <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={review.user?.image || undefined} alt={review.user?.name || "User"} />
                        <AvatarFallback className="bg-accent-400/10 text-caption-1-semibold text-accent-600">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                                <div className="text-body-semibold text-text-primary leading-tight">{review.user?.name || "User"}</div>
                                <StarsDisplay rating={review.rating} size={14} />
                            </div>
                            <span className="shrink-0 text-body-2-regular text-text-tertiary whitespace-nowrap">
                                {displayDate}
                            </span>
                        </div>
                        {review.comment && (
                            <div className="mt-2 rounded-md bg-background-secondary/80 mt-4">
                                <p className="text-body-2-regular text-text-secondary leading-relaxed whitespace-pre-wrap">
                                    {review.comment}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

const CreateReviewDialog: React.FC<{
    venueId: string;
    onCreated: (payload: { rating: number; comment?: string }) => void;
}> = ({ venueId, onCreated }) => {
    const router = useRouter();
    const { data: currentUser } = useCurrentUser();
    const [open, setOpen] = useState(false);
    const [rating, setRating] = useState<number>(0);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [comment, setComment] = useState<string>("");
    const [submitting, setSubmitting] = useState(false);

    const handleOpen = (value: boolean) => {
        if (value && !currentUser) {
            toast.error("Please sign in to write a review");
            router.push("/sign-in");
            return;
        }
        setOpen(value);
    };

    const submit = async () => {
        if (rating < 1 || rating > 5) {
            toast.error("Please select a rating between 1 and 5");
            return;
        }
        setSubmitting(true);
        try {
            const result = await createReview({ venueId, rating, comment: comment.trim() || undefined });
            if (result.success) {
                toast.success("Review submitted");
                onCreated({ rating, comment });
                setOpen(false);
                setRating(0);
                setComment("");
            } else {
                toast.error(result.error || "Failed to submit review");
            }
        } catch (e) {
            toast.error("Failed to submit review");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpen}>
            <DialogTrigger asChild>
                <Button variant="secondary" leadingIcon={RiMessage2Line}>
                    Write a Review
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader className="space-y-3">
                    <DialogTitle className="text-title-3-semibold text-center">Write a Review</DialogTitle>
                    <p className="text-body-regular text-text-secondary text-center">Share your experience with others</p>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <div className="space-y-3">
                        <div className="text-body-semibold text-text-primary">Your rating *</div>
                        <div className="flex items-center justify-center gap-2 rounded-xl bg-background-secondary p-4">
                            {Array.from({ length: 5 }).map((_, i) => {
                                const idx = i + 1;
                                const filled = (hoverRating || rating) >= idx;
                                return (
                                    <button
                                        key={idx}
                                        type="button"
                                        aria-label={`${idx} star`}
                                        onMouseEnter={() => setHoverRating(idx)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setRating(idx)}
                                        className="rounded-full p-2 transition-colors duration-150 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                                    >
                                        <Star
                                            size={24}
                                            className={filled ? "fill-yellow-400 text-yellow-400 drop-shadow-sm" : "text-muted-foreground/40 hover:text-yellow-300"}
                                        />
                                    </button>
                                );
                            })}
                        </div>
                        {rating > 0 && (
                            <p className="text-caption-1-regular text-center text-text-tertiary">
                                {rating === 1 ? "Poor" : rating === 2 ? "Fair" : rating === 3 ? "Good" : rating === 4 ? "Very Good" : "Excellent"}
                            </p>
                        )}
                    </div>
                    <div className="space-y-3">
                        <div className="text-body-semibold text-text-primary">Your review</div>
                        <Textarea
                            placeholder="Share details about your experience (optional)"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={5}
                            className="resize-none"
                        />
                        <p className="text-caption-1-regular text-text-tertiary">{comment.length}/500 characters</p>
                    </div>
                </div>
                <DialogFooter className="gap-3">
                    <Button variant="secondary" onClick={() => setOpen(false)} className="flex-1">
                        Cancel
                    </Button>
                    <Button
                        onClick={submit}
                        disabled={submitting || rating < 1}
                        variant="primary"
                        className="flex-1"
                    >
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        Submit Review
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ venueId, initialAverageRating, initialReviewCount, initialReviews }) => {
    const [page, setPage] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);
    const [reviewsList, setReviewsList] = useState<InitialReview[]>(initialReviews ?? []);
    const [totalCount, setTotalCount] = useState<number>(initialReviewCount ?? initialReviews?.length ?? 0);
    const [average, setAverage] = useState<number>(Number(initialAverageRating ?? 0));

    // If no initial reviews provided, fetch first page on mount
    useEffect(() => {
        const needsFetch = !initialReviews || initialReviews.length === 0;
        if (!needsFetch) return;
        (async () => {
            const res = await getVenueReviews(venueId, 1, 10);
            if (res.success) {
                setReviewsList(res.reviews as InitialReview[]);
                setTotalCount(res.totalCount ?? 0);
            }
        })();
    }, [initialReviews, venueId]);

    const hasMore = useMemo(() => reviewsList.length < totalCount, [reviewsList.length, totalCount]);

    const loadMore = async () => {
        if (!hasMore) return;
        setLoadingMore(true);
        try {
            const nextPage = page + 1;
            const res = await getVenueReviews(venueId, nextPage, 10);
            if (res.success) {
                setReviewsList((prev) => [...prev, ...(res.reviews as InitialReview[])]);
                setPage(nextPage);
                setTotalCount(res.totalCount ?? 0);
            }
        } finally {
            setLoadingMore(false);
        }
    };

    const handleCreated = ({ rating, comment }: { rating: number; comment?: string }) => {
        const newCount = totalCount + 1;
        const newAvg = (average * totalCount + rating) / newCount;
        setAverage(newAvg);
        setTotalCount(newCount);
        // Optimistically prepend a local review shell; actual data comes after revalidation
        setReviewsList((prev) => [
            {
                id: `temp-${Date.now()}`,
                rating,
                comment: comment ?? null,
                createdAt: new Date(),
                user: { id: "me", name: "You", image: null },
            },
            ...prev,
        ]);
    };

    const avgRating = Number.isFinite(average) ? average : 0;

    return (
      <section className="mt-14 space-y-6">
        {/* Reviews Header — rating summary + button aligned on one row */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <h2 className="text-title-1-bold text-text-primary">Reviews</h2>
            <div className="flex items-center gap-2.5">
              <StarsDisplay rating={avgRating} size={14} />
              <span className="text-title-2-bold text-text-primary tabular-nums">
                {avgRating.toFixed(1)}
              </span>
              <span className="text-body-2-regular text-text-tertiary">
                {totalCount} review{totalCount === 1 ? "" : "s"}
              </span>
            </div>
          </div>
          <CreateReviewDialog venueId={venueId} onCreated={handleCreated} />
        </div>

        {/* Reviews Content */}
        {reviewsList.length === 0 ? (
          <div className="rounded-3xl border border-border bg-background-primary-default py-16 text-center">
            <div className="mx-auto max-w-sm space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-background-secondary">
                <MessageSquarePlus className="h-8 w-8 text-text-tertiary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-title-3-semibold text-text-primary">
                  No reviews yet
                </h3>
                <p className="text-body-regular text-text-secondary leading-relaxed">
                  Be the first to share your experience and help others discover
                  this venue.
                </p>
              </div>
              <div className="pt-2">
                <CreateReviewDialog
                  venueId={venueId}
                  onCreated={handleCreated}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid gap-5">
              {reviewsList.map((r) => (
                <ReviewItem key={r.id} review={r} />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center pt-2">
                <Button
                  variant="ghost"
                  onClick={loadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>Load more reviews</>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </section>
    );
};

export default ReviewsSection;