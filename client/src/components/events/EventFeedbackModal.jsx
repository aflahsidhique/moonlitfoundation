import { useRef } from "react";
import Modal from "../ui/Modal";
import MfForm from "../ui/MfForm";
import { TextField, TextareaField } from "../ui/FormField";

export default function EventFeedbackModal({ eventId, eventTitle, onClose }) {
  const ratingErrorRef = useRef(null);

  function validateRating(form) {
    const checked = form.querySelector('input[name="rating"]:checked');
    if (ratingErrorRef.current) ratingErrorRef.current.style.display = checked ? "none" : "block";
    return !!checked;
  }

  return (
    <Modal open={!!eventId} onClose={onClose} title={`Feedback — ${eventTitle}`} subtitle="Tell us how it went — it helps us plan the next one.">
      <MfForm endpoint={`/events/${eventId}/feedback`} successMessage="Thanks for your feedback!" onSuccess={onClose} validate={validateRating}>
        <div className="space-y-4">
          <div>
            <label className="mf-label">Your Rating *</label>
            <div className="mf-star-input">
              <input type="radio" id="fb-star-5" name="rating" value="5" /><label htmlFor="fb-star-5" title="5 stars"><i className="fa-solid fa-star"></i></label>
              <input type="radio" id="fb-star-4" name="rating" value="4" /><label htmlFor="fb-star-4" title="4 stars"><i className="fa-solid fa-star"></i></label>
              <input type="radio" id="fb-star-3" name="rating" value="3" /><label htmlFor="fb-star-3" title="3 stars"><i className="fa-solid fa-star"></i></label>
              <input type="radio" id="fb-star-2" name="rating" value="2" /><label htmlFor="fb-star-2" title="2 stars"><i className="fa-solid fa-star"></i></label>
              <input type="radio" id="fb-star-1" name="rating" value="1" /><label htmlFor="fb-star-1" title="1 star"><i className="fa-solid fa-star"></i></label>
            </div>
            <p className="mf-error-msg" ref={ratingErrorRef}>Please choose a rating.</p>
          </div>
          <TextField label="Full Name" name="name" required placeholder="Your name" />
          <TextField label="Email" name="email" type="email" required placeholder="you@example.com" error="Please enter a valid email." />
          <TextareaField label="Comments" name="comment" hint="(optional)" rows={3} placeholder="What stood out?" />
        </div>
        <button className="mf-btn mf-btn-primary mt-6 w-full justify-center">Submit Feedback <i className="fa-solid fa-arrow-right"></i></button>
      </MfForm>
    </Modal>
  );
}
