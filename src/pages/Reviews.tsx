import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LanguageSelector from "@/components/LanguageSelector";
import { toast } from "@/hooks/use-toast";
import { Star, ArrowLeft, Users, Send, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Review {
  id: string;
  user_id: string;
  user_name: string;
  rating: number;
  feedback: string;
  created_at: string;
}

const Reviews = () => {
  const navigate = useNavigate();
  const { user, profile, isDentist } = useAuth();
  const { t } = useI18n();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    fetchReviews();
    if (isDentist) fetchUserCount();
  }, [isDentist]);

  const fetchReviews = async () => {
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setReviews(data);
  };

  const fetchUserCount = async () => {
    const { count } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });
    setTotalUsers(count ?? 0);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({ title: "Please sign in to leave a review", variant: "destructive" });
      return;
    }
    if (!feedback.trim()) {
      toast({ title: "Please write some feedback", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert({
      user_id: user.id,
      user_name: profile?.full_name || user.email?.split("@")[0] || "User",
      rating,
      feedback: feedback.trim(),
    });

    if (error) {
      toast({ title: "Failed to submit review", variant: "destructive" });
    } else {
      toast({ title: "Thank you for your feedback! ⭐" });
      setFeedback("");
      setRating(5);
      fetchReviews();
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("reviews").delete().eq("id", id);
    fetchReviews();
  };

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "0";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur border-b border-border px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <h1 className="text-lg font-bold text-foreground">Reviews & Feedback</h1>
          <LanguageSelector />
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Admin Stats - Only visible to dentists/leaders */}
        {isDentist && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Registered Users</p>
                      <p className="text-2xl font-bold text-foreground">{totalUsers}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Average Rating</p>
                    <p className="text-2xl font-bold text-foreground flex items-center gap-1">
                      {avgRating} <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total Reviews</p>
                    <p className="text-2xl font-bold text-foreground">{reviews.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Submit Review */}
        {user && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Share Your Feedback</CardTitle>
              <CardDescription>Rate your experience with DentaScan AI</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Star Rating */}
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground mr-2">Your Rating:</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-7 w-7 transition-colors ${
                        star <= (hoverRating || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  </button>
                ))}
                <Badge variant="secondary" className="ml-2">{rating}/5</Badge>
              </div>

              <Textarea
                placeholder="Tell us what you think about DentaScan AI..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                maxLength={500}
                className="min-h-[100px]"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{feedback.length}/500</span>
                <Button onClick={handleSubmit} disabled={submitting}>
                  <Send className="h-4 w-4 mr-1" />
                  {submitting ? "Submitting..." : "Submit Review"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!user && (
          <Card className="text-center p-8">
            <p className="text-muted-foreground mb-3">Sign in to leave a review</p>
            <Button onClick={() => navigate("/auth")}>Sign In</Button>
          </Card>
        )}

        {/* Reviews List */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">
            All Reviews ({reviews.length})
          </h2>
          <div className="space-y-3">
            <AnimatePresence>
              {reviews.map((review) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-foreground">
                              {review.user_name || "User"}
                            </span>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`h-3.5 w-3.5 ${
                                    s <= review.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-muted-foreground/20"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{review.feedback}</p>
                        </div>
                        {user?.id === review.user_id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDelete(review.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {reviews.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No reviews yet. Be the first to share your experience!
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Reviews;
