import { Check, Minus } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "./SectionHeader";

const PERMISSIONS: [string, boolean, boolean, boolean][] = [
  ["Create & delete projects", true, false, false],
  ["Invite people & set roles", true, false, false],
  ["Create & move tasks", true, true, false],
  ["Assign teammates", true, true, false],
  ["Comment & @mention", true, true, true],
  ["View boards", true, true, true],
];

function Cell({ allowed }: { allowed: boolean }) {
  return (
    <td className="px-4 py-3.5">
      {allowed ? (
        <Check className="size-[18px] text-teal" strokeWidth={2.6} aria-label="Allowed" />
      ) : (
        <Minus className="size-[18px] text-faint" aria-label="Not allowed" />
      )}
    </td>
  );
}

export function Roles() {
  return (
    <section id="roles" className="scroll-mt-20 border-y border-line bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap gap-14 px-4 py-24 sm:px-5 lg:py-28">
        <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-6">
          <SectionHeader
            eyebrow="Teams & roles"
            title="The right access for everyone."
            body="Invite people to a single project or your whole workspace. Owners stay in control, members get to work, and viewers see only what you share."
          />
          <Reveal delay={0.1}>
            <ButtonLink href="/auth/register" variant="dark" size="lg">
              Create your workspace
            </ButtonLink>
          </Reveal>
        </div>
        <Reveal delay={0.15} className="min-w-0 flex-[1_1_540px]">
          <div className="overflow-x-auto rounded-[20px] border border-line">
            <table className="w-full min-w-[480px] border-collapse text-sm">
              <thead>
                <tr className="bg-canvas text-left">
                  <th className="px-5 py-4 font-semibold">Permission</th>
                  <th className="px-4 py-4 font-semibold">Owner</th>
                  <th className="px-4 py-4 font-semibold">Member</th>
                  <th className="px-4 py-4 font-semibold">Viewer</th>
                </tr>
              </thead>
              <tbody>
                {PERMISSIONS.map(([label, owner, member, viewer]) => (
                  <tr key={label} className="border-t border-line transition-colors hover:bg-canvas/60">
                    <td className="px-5 py-3.5">{label}</td>
                    <Cell allowed={owner} />
                    <Cell allowed={member} />
                    <Cell allowed={viewer} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
