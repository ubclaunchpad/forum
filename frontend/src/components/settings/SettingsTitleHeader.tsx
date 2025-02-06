import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function SettingsTitleHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col gap-2  pb-4">
      <h1 className="text-3xl font-semibold ">{title}</h1>
      <p className=" text-neutral-500">{description}</p>
    </div>
  );
}

interface SettingsSubSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  id: string;
}

export function SettingsSubSection({
  title,
  description,
  children,
  id,
}: SettingsSubSectionProps) {
  return (
    <Card className="" id={id}>
      <CardHeader>
        <h2 className="text-xl font-semibold">{title}</h2>
        {description && (
          <p className="text-sm text-neutral-500">{description}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-6 w-full ">{children}</CardContent>
    </Card>
  );
}
