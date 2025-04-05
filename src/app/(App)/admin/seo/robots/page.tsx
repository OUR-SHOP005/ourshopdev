"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RobotsConfigPage() {
  const router = useRouter();
  const [robotsConfig, setRobotsConfig] = useState({
    domain: "",
    allow: "",
    disallow: "",
    sitemap: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch the current robots.txt configuration
  useEffect(() => {
    async function fetchRobotsConfig() {
      setIsLoading(true);
      try {
        const response = await fetch("/api/seo/robots-config");
        if (response.ok) {
          const data = await response.json();
          setRobotsConfig({
            domain: data.host || "",
            allow: Array.isArray(data.rules?.[0]?.allow)
              ? data.rules[0].allow.join("\n")
              : "",
            disallow: Array.isArray(data.rules?.[0]?.disallow)
              ? data.rules[0].disallow.join("\n")
              : "",
            sitemap: !!data.sitemap,
          });
        } else {
          toast.error("Failed to load robots.txt configuration");
        }
      } catch (error) {
        console.error("Error fetching robots config:", error);
        toast.error("An error occurred while loading robots.txt configuration");
      } finally {
        setIsLoading(false);
      }
    }

    fetchRobotsConfig();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Prepare the payload
      const payload = {
        host: robotsConfig.domain,
        rules: [
          {
            userAgent: "*",
            allow: robotsConfig.allow
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean),
            disallow: robotsConfig.disallow
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean),
          },
        ],
        sitemap: robotsConfig.sitemap
          ? `${robotsConfig.domain}/sitemap.xml`
          : undefined,
      };

      const response = await fetch("/api/seo/robots-config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success("Robots.txt configuration saved successfully");
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to save robots.txt configuration");
      }
    } catch (error) {
      console.error("Error saving robots config:", error);
      toast.error("An error occurred while saving robots.txt configuration");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setRobotsConfig((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setRobotsConfig((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // Preview of the robots.txt file
  const robotsPreview = `User-agent: *
${robotsConfig.allow
  .split("\n")
  .map((path) => `Allow: ${path.trim()}`)
  .join("\n")}
${robotsConfig.disallow
  .split("\n")
  .map((path) => `Disallow: ${path.trim()}`)
  .join("\n")}
${robotsConfig.sitemap ? `Sitemap: ${robotsConfig.domain}/sitemap.xml` : ""}
`;

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>Robots.txt Configuration</h1>
        <Button
          variant='outline'
          onClick={() => router.back()}
        >
          Back
        </Button>
      </div>

      {isLoading ? (
        <div className='flex justify-center py-8'>
          <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className='space-y-6'
        >
          <Card>
            <CardHeader>
              <CardTitle>Domain Settings</CardTitle>
              <CardDescription>
                Configure the domain used in your robots.txt file
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                <Label htmlFor='domain'>Domain URL</Label>
                <Input
                  id='domain'
                  name='domain'
                  placeholder='https://example.com'
                  value={robotsConfig.domain}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>

          <div className='grid gap-4 grid-cols-1 md:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>Allowed Paths</CardTitle>
                <CardDescription>
                  Enter one path per line that search engines are allowed to
                  crawl
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  name='allow'
                  placeholder='/\n/about/\n/blog/'
                  className='h-40 font-mono'
                  value={robotsConfig.allow}
                  onChange={handleChange}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Disallowed Paths</CardTitle>
                <CardDescription>
                  Enter one path per line that search engines should not crawl
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  name='disallow'
                  placeholder='/admin/\n/private/\n/*.json'
                  className='h-40 font-mono'
                  value={robotsConfig.disallow}
                  onChange={handleChange}
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sitemap Settings</CardTitle>
              <CardDescription>
                Configure sitemap settings for robots.txt
              </CardDescription>
            </CardHeader>
            <CardContent className='flex items-center gap-4'>
              <input
                type='checkbox'
                id='sitemap'
                name='sitemap'
                checked={robotsConfig.sitemap}
                onChange={handleCheckboxChange}
                className='h-5 w-5'
              />
              <Label htmlFor='sitemap'>Include sitemap reference</Label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                Preview of the generated robots.txt file
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className='bg-muted p-4 rounded-md overflow-auto text-sm font-mono whitespace-pre'>
                {robotsPreview}
              </pre>
            </CardContent>
            <CardFooter>
              <Button
                type='submit'
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Saving...
                  </>
                ) : (
                  "Save Configuration"
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}
    </div>
  );
}
