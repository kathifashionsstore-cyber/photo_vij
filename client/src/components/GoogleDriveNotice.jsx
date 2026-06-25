import { ExternalLink } from "lucide-react";

export const GOOGLE_DRIVE_TEASERS_URL =
  "https://drive.google.com/drive/folders/1UHmQbPEhHxNeIiWYZk3H-VOVFzlQPRka?usp=sharing";

export default function GoogleDriveNotice() {
  return (
    <section className="bg-[#090807] px-6 py-12 md:px-12">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[8px] border-y border-brand-gold/55 bg-[#0b0907] px-6 py-10 text-center shadow-[0_0_36px_rgba(201,162,39,0.08)] md:px-12">
        <div className="mx-auto mb-8 h-px max-w-2xl bg-gradient-to-r from-transparent via-brand-gold to-transparent" />
        <div className="mx-auto max-w-[700px] space-y-5 text-sm leading-8 text-white/78 md:text-[15px]">
          <p>
            Please note that we do not upload all teasers on Instagram due to audio copyright restrictions. If you would like to see more teasers and promo videos from our previous events, please feel free to ask us and we will be happy to share them with you.
          </p>
          <p>
            We have shared a Google Drive link below. Kindly watch the videos in high resolution with a good network connection for the best viewing experience. Also, we recommend using headphones for a better sound experience.
          </p>
        </div>
        <a
          href={GOOGLE_DRIVE_TEASERS_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-brand-gold px-7 py-3.5 text-base font-bold text-black shadow-[0_0_28px_rgba(201,162,39,0.28)] transition-colors hover:bg-amber-500"
        >
          Watch on Google Drive <span aria-hidden="true">{"\u2192"}</span>
          <ExternalLink className="h-4 w-4" />
        </a>
        <p className="mt-4 text-xs text-white/45">{"\u{1F3A7}"} Best experienced with headphones {"\u00B7"} High resolution recommended</p>
        <div className="mx-auto mt-8 h-px max-w-2xl bg-gradient-to-r from-transparent via-brand-gold to-transparent" />
      </div>
    </section>
  );
}
