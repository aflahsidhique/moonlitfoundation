import Modal from "../ui/Modal";
import MfForm from "../ui/MfForm";
import { TextField } from "../ui/FormField";

export default function EventRegisterModal({ eventId, eventTitle, onClose }) {
  return (
    <Modal open={!!eventId} onClose={onClose} title={`Register — ${eventTitle}`} subtitle="We'll email you a confirmation once you submit.">
      <MfForm endpoint={`/events/${eventId}/register`} successMessage="You're registered! We'll be in touch with details." onSuccess={onClose}>
        <div className="space-y-4">
          <TextField label="Full Name" name="name" required placeholder="Your name" />
          <TextField label="Email" name="email" type="email" required placeholder="you@example.com" error="Please enter a valid email." />
          <TextField label="Phone" name="phone" type="tel" required placeholder="+91 ..." error="Please enter your phone number." />
        </div>
        <button className="mf-btn mf-btn-primary mt-6 w-full justify-center">Confirm Registration <i className="fa-solid fa-arrow-right"></i></button>
      </MfForm>
    </Modal>
  );
}
