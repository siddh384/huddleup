"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquarePlus, Loader2 } from "lucide-react";
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
        <div className={`flex items-center gap-1 ${className ?? ""}`}>
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
        <Card className="border-muted/40 shadow-sm hover:shadow-md transition-shadow duration-200 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
                <div className="flex items-start gap-5">
                    <Avatar className="h-12 w-12 ring-2 ring-primary/10">
                        <AvatarImage src={review.user?.image || undefined} alt={review.user?.name || "User"} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                                <div className="font-semibold text-foreground text-base leading-tight">{review.user?.name || "User"}</div>
                                <StarsDisplay rating={review.rating} size={18} />
                            </div>
                            <div className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                                {displayDate}
                            </div>
                        </div>
                        {review.comment && (
                            <div className="bg-muted/30 rounded-lg p-4 border border-muted/50">
                                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
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
                <Button size="sm" className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md hover:shadow-lg transition-all duration-200">
                    <MessageSquarePlus className="w-4 h-4 mr-2" />
                    Write a Review
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader className="space-y-3">
                    <DialogTitle className="text-xl font-semibold text-center">Write a Review</DialogTitle>
                    <p className="text-sm text-muted-foreground text-center">Share your experience with others</p>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <div className="space-y-3">
                        <div className="text-sm font-medium text-foreground">Your rating *</div>
                        <div className="flex items-center justify-center gap-2 p-4 bg-muted/30 rounded-lg border border-muted/50">
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
                                        className="p-2 rounded-full hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors duration-150"
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
                            <p className="text-xs text-center text-muted-foreground">
                                {rating === 1 ? "Poor" : rating === 2 ? "Fair" : rating === 3 ? "Good" : rating === 4 ? "Very Good" : "Excellent"}
                            </p>
                        )}
                    </div>
                    <div className="space-y-3">
                        <div className="text-sm font-medium text-foreground">Your review</div>
                        <Textarea
                            placeholder="Share details about your experience (optional)"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={5}
                            className="resize-none"
                        />
                        <p className="text-xs text-muted-foreground">{comment.length}/500 characters</p>
                    </div>
                </div>
                <DialogFooter className="gap-3">
                    <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
                        Cancel
                    </Button>
                    <Button
                        onClick={submit}
                        disabled={submitting || rating < 1}
                        className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                    >
                        {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
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

    return (
        <section className="mt-16 space-y-8">
            {/* Reviews Header */}
            <div className="space-y-6">
                <div className="flex items-end justify-between gap-4 flex-wrap">
                    <div>
                        <h2 className="text-3xl font-bold mb-1">Reviews</h2>
                        <div className="flex items-center gap-3 text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <StarsDisplay rating={Number.isFinite(average) ? average : 0} className="-mt-0.5" />
                                <span className="font-semibold text-foreground">{Number.isFinite(average) ? average.toFixed(1) : "0.0"}</span>
                            </div>
                            <Badge variant="secondary" className="text-xs">{totalCount} review{totalCount === 1 ? "" : "s"}</Badge>
                        </div>
                    </div>
                    <CreateReviewDialog venueId={venueId} onCreated={handleCreated} />
                </div>
            </div>

            {/* Reviews Content */}
            {reviewsList.length === 0 ? (
                <div className="text-center py-16 px-8">
                    <div className="max-w-md mx-auto space-y-4">
                        <div className="w-20 h-20 mx-auto bg-muted/30 rounded-full flex items-center justify-center">
                            <MessageSquarePlus className="w-10 h-10 text-muted-foreground/50" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-semibold text-foreground">No reviews yet</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Be the first to share your experience and help others discover this venue.
                            </p>
                        </div>
                        <div className="pt-4">
                            <CreateReviewDialog venueId={venueId} onCreated={handleCreated} />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid gap-6">
                        {reviewsList.map((r) => (
                            <ReviewItem key={r.id} review={r} />
                        ))}
                    </div>

                    {hasMore && (
                        <div className="flex justify-center pt-4">
                            <Button
                                variant="outline"
                                onClick={loadMore}
                                disabled={loadingMore}
                                className="px-8 py-2 hover:bg-muted/50 transition-colors duration-200"
                            >
                                {loadingMore ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        Load more reviews
                                    </>
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


