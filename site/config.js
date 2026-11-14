/* P Square Interior Studio — THE one settings file. Edit values here only. */
window.PSQ_CONFIG = {
  // LAUNCH COUNTDOWN (the screen people see at the main address before launch; ?preview=1 always shows the full site).
  // null = "Launching soon — after Diwali" screen with no numbers. To start the countdown, put the date + time (India time) in quotes,
  // e.g. LAUNCH_AT: "2026-11-15T10:00:00+05:30" — numbers count down and at zero the site opens by itself with the reveal.
  LAUNCH_AT: "2026-11-13T00:00:00+05:30",
  // Line under the countdown. "" hides it.
  LAUNCH_NOTE: "Something beautiful is on its way. See you after Diwali.",
  // Studio phone number (used for Call AND WhatsApp). Leave "" until the real number is known —
  // buttons then show a neutral "number coming soon" state. Example: "+91 98765 43210"
  PHONE: "",
  // Optional: a different WhatsApp number (digits with country code, e.g. "919876543210"). "" = use PHONE.
  WHATSAPP: "",
  ADDRESS: "Gandhinagar, Gujarat",          // shown in Contact + footer (placeholder until the full address is known)
  CITY: "Gandhinagar",
  MAP_URL: "https://www.google.com/maps/search/?api=1&query=P+Square+Interior+Studio+Gandhinagar",
  INSTAGRAM: "https://www.instagram.com/p_square_interior_studio/",
  GOOGLE_REVIEWS_URL: "",                   // "" hides the "Read all reviews" button
  // Studio walkthrough loop (always starts muted; a Sound button appears when STUDIO_VIDEO_HAS_SOUND is true) + its poster. Swap both here to change the video.
  STUDIO_VIDEO: "assets/media/office-studio.mp4?v=pro3",
  STUDIO_POSTER: "assets/img/studio-v3.jpg",
  STUDIO_VIDEO_HAS_SOUND: true,             // true = show the gold Sound on/off button (video still starts muted)
  // OUR TEAM section. One entry per person, shown in this order. Leave name/role "" to show "coming soon";
  // photo = a square .jpg (~600x600) copied into site/assets/img/, written as "assets/img/" + its file name; "" = gold silhouette.
  // Example: { name: "Full Name", role: "Their role", photo: "assets/img/" + file name, e.g. the path of team-photo-1.jpg }  (then re-run build_private.py)
  TEAM: [
    { name: "", role: "", photo: "" },
    { name: "", role: "", photo: "" },
    { name: "", role: "", photo: "" },
    { name: "", role: "", photo: "" }
  ]
};
