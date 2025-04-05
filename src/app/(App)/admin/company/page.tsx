"use client";

import { useState, useEffect } from "react";
import {
  useCompanyInfo,
  useUpdateCompanyInfo,
} from "@/lib/api/services/companyService";
import { ICompanyInfo } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, PlusCircle, Save, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { companyInfoSchema } from "@/lib/types";
import Image from "next/image";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { FieldErrors } from "react-hook-form";

// Error summary component to display validation errors
const FormErrorSummary = ({
  errors,
  activeTab,
  setActiveTab,
}: {
  errors: FieldErrors<ICompanyInfo>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) => {
  if (Object.keys(errors).length === 0) return null;

  // Helper to check if a specific tab has errors
  const hasTabErrors = (tabName: string) => {
    switch (tabName) {
      case "general":
        return !!(
          errors.company_name ||
          errors.tagline ||
          errors.description ||
          errors.email ||
          errors.location ||
          errors.logo
        );
      case "team":
        return !!errors.team;
      case "social":
        return !!errors.socialLinks;
      case "stories":
        return !!errors.stories;
      default:
        return false;
    }
  };

  // Find the first tab with errors if not already on a tab with errors
  const navigateToFirstErrorTab = () => {
    if (!hasTabErrors(activeTab)) {
      if (hasTabErrors("general")) setActiveTab("general");
      else if (hasTabErrors("team")) setActiveTab("team");
      else if (hasTabErrors("social")) setActiveTab("social");
      else if (hasTabErrors("stories")) setActiveTab("stories");
    }
  };

  return (
    <div className='mb-6 p-4 border border-red-300 bg-red-50 rounded-md'>
      <div className='flex justify-between items-start'>
        <h3 className='text-red-600 font-medium mb-2'>
          Please fix the following errors before saving:
        </h3>
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='text-red-600 border-red-300 hover:bg-red-100'
          onClick={navigateToFirstErrorTab}
        >
          Go to first error
        </Button>
      </div>
      <ul className='list-disc pl-5 space-y-1 text-sm text-red-600'>
        {errors.company_name && (
          <li>Company name: {errors.company_name.message}</li>
        )}
        {errors.tagline && <li>Tagline: {errors.tagline.message}</li>}
        {errors.description && (
          <li>Description: {errors.description.message}</li>
        )}
        {errors.email && <li>Email: {errors.email.message}</li>}
        {errors.location && <li>Location: {errors.location.message}</li>}
        {errors.logo && <li>Logo: {errors.logo.message}</li>}
        {errors.team && (
          <li>
            Team Members:{" "}
            {errors.team.message ||
              "Please check team member fields for errors"}
            {errors.team.root?.message && (
              <span> ({errors.team.root.message})</span>
            )}
          </li>
        )}
        {errors.socialLinks && (
          <li>
            Social Links:{" "}
            {errors.socialLinks.message ||
              "Please check social link fields for errors"}
            {errors.socialLinks.root?.message && (
              <span> ({errors.socialLinks.root.message})</span>
            )}
          </li>
        )}
        {errors.stories && (
          <li>
            Company Stories:{" "}
            {errors.stories.message || "Please check story fields for errors"}
            {errors.stories.root?.message && (
              <span> ({errors.stories.root.message})</span>
            )}
          </li>
        )}
      </ul>
    </div>
  );
};

export default function CompanyAdminPage() {
  const { data: companyInfo, isLoading } = useCompanyInfo();
  const updateCompanyMutation = useUpdateCompanyInfo();
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    control,
    setValue,
    watch,
  } = useForm<ICompanyInfo>({
    resolver: zodResolver(companyInfoSchema),
    defaultValues: {
      company_name: "",
      tagline: "",
      description: "",
      logo: "",
      email: "",
      location: "",
      socialLinks: [],
      stories: [],
      team: [],
      updatedAt: new Date(),
    },
  });

  const {
    fields: socialFields,
    append: appendSocial,
    remove: removeSocial,
  } = useFieldArray({
    control,
    name: "socialLinks",
  });

  const {
    fields: storyFields,
    append: appendStory,
    remove: removeStory,
  } = useFieldArray({
    control,
    name: "stories",
  });

  const {
    fields: teamFields,
    append: appendTeam,
    remove: removeTeam,
  } = useFieldArray({
    control,
    name: "team",
  });

  const watchLogo = watch("logo");

  // Initialize form when data is loaded
  useEffect(() => {
    if (companyInfo && !isDirty) {
      setValue("company_name", companyInfo.company_name);
      setValue("tagline", companyInfo.tagline);
      setValue("description", companyInfo.description);
      setValue("logo", companyInfo.logo || "");
      setValue("email", companyInfo.email);
      setValue("location", companyInfo.location);
      setValue("socialLinks", companyInfo.socialLinks || []);
      setValue("stories", companyInfo.stories || []);
      setValue("team", companyInfo.team || []);
    }
  }, [companyInfo, isDirty, setValue]);

  const onSubmit = async (data: ICompanyInfo) => {
    try {
      await updateCompanyMutation.mutateAsync(data);
      toast.success("Company information updated successfully");
    } catch (error) {
      toast.error("Failed to update company information");
      console.error("Update error:", error);
    }
  };

  const handleLogoUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("images", file);
    setIsUploadingLogo(true);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const logoUrl = data.files[0]?.url;
        setValue("logo", logoUrl);
        toast.success("Logo uploaded successfully");
      } else {
        toast.error("Error uploading logo");
      }
    } catch (error) {
      toast.error("Error uploading logo");
      console.error("Upload error:", error);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleTeamMemberImageUpload = async (file: File, index: number) => {
    const formData = new FormData();
    formData.append("images", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const imageUrl = data.files[0]?.url;
        const currentTeam = [...watch("team")];
        currentTeam[index].profileImage = imageUrl;
        setValue("team", currentTeam);
        toast.success("Profile image uploaded successfully");
      } else {
        toast.error("Error uploading profile image");
      }
    } catch (error) {
      toast.error("Error uploading profile image");
      console.error("Upload error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className='p-4 space-y-4'>
        <Skeleton className='h-10 w-1/3' />
        <Card>
          <CardHeader>
            <Skeleton className='h-8 w-1/4' />
            <Skeleton className='h-4 w-2/3' />
          </CardHeader>
          <CardContent className='space-y-4'>
            <Skeleton className='h-10 w-full' />
            <Skeleton className='h-10 w-full' />
            <Skeleton className='h-32 w-full' />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='p-4 space-y-4'>
      <h1 className='text-2xl font-bold'>Company Information</h1>

      <FormErrorSummary
        errors={errors}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className='mb-4'>
            <TabsTrigger value='general'>General</TabsTrigger>
            <TabsTrigger value='team'>
              Team Members{" "}
              {errors.team && (
                <span className='ml-1 text-xs text-red-500'>⚠️</span>
              )}
            </TabsTrigger>
            <TabsTrigger value='social'>
              Social Links{" "}
              {errors.socialLinks && (
                <span className='ml-1 text-xs text-red-500'>⚠️</span>
              )}
            </TabsTrigger>
            <TabsTrigger value='stories'>
              Company Stories{" "}
              {errors.stories && (
                <span className='ml-1 text-xs text-red-500'>⚠️</span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* General Information Tab */}
          <TabsContent value='general'>
            <Card>
              <CardHeader>
                <CardTitle>General Information</CardTitle>
                <CardDescription>
                  Update your company&apos;s basic information
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='company_name'>Company Name</Label>
                    <Input
                      id='company_name'
                      {...register("company_name")}
                    />
                    {errors.company_name && (
                      <p className='text-sm text-red-500'>
                        {errors.company_name.message}
                      </p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='email'>Email</Label>
                    <Input
                      id='email'
                      type='email'
                      {...register("email")}
                    />
                    {errors.email && (
                      <p className='text-sm text-red-500'>
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='tagline'>Tagline</Label>
                    <Input
                      id='tagline'
                      {...register("tagline")}
                    />
                    {errors.tagline && (
                      <p className='text-sm text-red-500'>
                        {errors.tagline.message}
                      </p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='location'>Location</Label>
                    <Input
                      id='location'
                      {...register("location")}
                    />
                    {errors.location && (
                      <p className='text-sm text-red-500'>
                        {errors.location.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='description'>Description</Label>
                  <Textarea
                    id='description'
                    {...register("description")}
                    rows={5}
                  />
                  {errors.description && (
                    <p className='text-sm text-red-500'>
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='logo'>Company Logo</Label>
                  <div className='flex items-start gap-4'>
                    <div className='flex-1'>
                      <Input
                        id='logoFile'
                        type='file'
                        accept='image/*'
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleLogoUpload(file);
                          }
                        }}
                        disabled={isUploadingLogo}
                      />
                      {isUploadingLogo && (
                        <div className='flex items-center mt-2 text-sm text-muted-foreground'>
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                          Uploading...
                        </div>
                      )}
                    </div>

                    {watchLogo && (
                      <div className='w-20 h-20 relative'>
                        <AspectRatio ratio={1}>
                          <Image
                            src={watchLogo}
                            alt='Company Logo'
                            fill
                            className='object-contain'
                          />
                        </AspectRatio>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Members Tab */}
          <TabsContent value='team'>
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  Manage your company team members
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                {teamFields.map((field, index) => (
                  <div
                    key={field.id}
                    className='p-4 border rounded-lg space-y-4 relative'
                  >
                    <Button
                      type='button'
                      variant='destructive'
                      size='icon'
                      className='absolute top-2 right-2'
                      onClick={() => removeTeam(index)}
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div className='space-y-2'>
                        <Label htmlFor={`team.${index}.name`}>Name</Label>
                        <Input
                          id={`team.${index}.name`}
                          {...register(`team.${index}.name`)}
                        />
                        {errors.team?.[index]?.name && (
                          <p className='text-sm text-red-500'>
                            {errors.team?.[index]?.name?.message}
                          </p>
                        )}
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor={`team.${index}.position`}>
                          Position
                        </Label>
                        <Input
                          id={`team.${index}.position`}
                          {...register(`team.${index}.position`)}
                        />
                        {errors.team?.[index]?.position && (
                          <p className='text-sm text-red-500'>
                            {errors.team?.[index]?.position?.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor={`team.${index}.about`}>About</Label>
                      <Textarea
                        id={`team.${index}.about`}
                        {...register(`team.${index}.about`)}
                        rows={3}
                      />
                      {errors.team?.[index]?.about && (
                        <p className='text-sm text-red-500'>
                          {errors.team?.[index]?.about?.message}
                        </p>
                      )}
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor={`team.${index}.skills`}>
                        Skills (comma separated)
                      </Label>
                      <Input
                        id={`team.${index}.skills`}
                        placeholder='React, TypeScript, Next.js'
                        defaultValue={
                          Array.isArray(watch(`team.${index}.skills`))
                            ? watch(`team.${index}.skills`).join(", ")
                            : "default"
                        }
                        onChange={(e) => {
                          // Store the raw input value in a data attribute
                          e.currentTarget.dataset.rawValue = e.target.value;

                          // Only parse and set the array when the user has finished typing
                          // (e.g., when they've added a comma or we're about to blur)
                          if (
                            e.target.value.endsWith(",") ||
                            e.type === "blur"
                          ) {
                            const skillsArray = e.target.value
                              .split(",")
                              .map((skill) => skill.trim())
                              .filter(Boolean);
                            setValue(`team.${index}.skills`, skillsArray);
                          }
                        }}
                        onBlur={(e) => {
                          // On blur, always parse the current value
                          const rawValue =
                            e.currentTarget.dataset.rawValue || e.target.value;
                          const skillsArray = rawValue
                            .split(",")
                            .map((skill) => skill.trim())
                            .filter(Boolean);
                          setValue(`team.${index}.skills`, skillsArray);
                        }}
                      />
                      {errors.team?.[index]?.skills && (
                        <p className='text-sm text-red-500'>
                          {errors.team?.[index]?.skills?.message ||
                            "Please add at least one skill"}
                        </p>
                      )}
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor={`team.${index}.profileImage`}>
                        Profile Image
                      </Label>
                      <div className='flex items-start gap-4'>
                        <div className='flex-1'>
                          <Input
                            id={`profileImageFile-${index}`}
                            type='file'
                            accept='image/*'
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleTeamMemberImageUpload(file, index);
                              }
                            }}
                          />
                        </div>

                        {watch(`team.${index}.profileImage`) && (
                          <div className='w-16 h-16 relative'>
                            <AspectRatio ratio={1}>
                              <Image
                                src={watch(`team.${index}.profileImage`) || ""}
                                alt='Profile'
                                fill
                                className='object-cover rounded-md'
                              />
                            </AspectRatio>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  type='button'
                  variant='outline'
                  onClick={() =>
                    appendTeam({
                      name: "",
                      position: "",
                      about: "",
                      skills: [],
                      profileImage: "",
                    })
                  }
                  className='w-full'
                >
                  <PlusCircle className='mr-2 h-4 w-4' />
                  Add Team Member
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Links Tab */}
          <TabsContent value='social'>
            <Card>
              <CardHeader>
                <CardTitle>Social Links</CardTitle>
                <CardDescription>
                  Manage your company&apos;s social media presence
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                {socialFields.map((field, index) => (
                  <div
                    key={field.id}
                    className='p-4 border rounded-lg space-y-4 relative'
                  >
                    <Button
                      type='button'
                      variant='destructive'
                      size='icon'
                      className='absolute top-2 right-2'
                      onClick={() => removeSocial(index)}
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div className='space-y-2'>
                        <Label htmlFor={`socialLinks.${index}.name`}>
                          Name
                        </Label>
                        <Input
                          id={`socialLinks.${index}.name`}
                          {...register(`socialLinks.${index}.name`)}
                        />
                        {errors.socialLinks?.[index]?.name && (
                          <p className='text-sm text-red-500'>
                            {errors.socialLinks?.[index]?.name?.message}
                          </p>
                        )}
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor={`socialLinks.${index}.platform`}>
                          Platform
                        </Label>
                        <Input
                          id={`socialLinks.${index}.platform`}
                          {...register(`socialLinks.${index}.platform`)}
                          placeholder='github, linkedin, twitter, etc.'
                        />
                        {errors.socialLinks?.[index]?.platform && (
                          <p className='text-sm text-red-500'>
                            {errors.socialLinks?.[index]?.platform?.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor={`socialLinks.${index}.url`}>URL</Label>
                      <Input
                        id={`socialLinks.${index}.url`}
                        {...register(`socialLinks.${index}.url`)}
                        type='url'
                      />
                      {errors.socialLinks?.[index]?.url && (
                        <p className='text-sm text-red-500'>
                          {errors.socialLinks?.[index]?.url?.message}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                <Button
                  type='button'
                  variant='outline'
                  onClick={() =>
                    appendSocial({
                      name: "",
                      platform: "",
                      url: "",
                    })
                  }
                  className='w-full'
                >
                  <PlusCircle className='mr-2 h-4 w-4' />
                  Add Social Link
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Company Stories Tab */}
          <TabsContent value='stories'>
            <Card>
              <CardHeader>
                <CardTitle>Company Stories</CardTitle>
                <CardDescription>
                  Share your company&apos;s journey and milestones
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                {storyFields.map((field, index) => (
                  <div
                    key={field.id}
                    className='p-4 border rounded-lg space-y-4 relative'
                  >
                    <Button
                      type='button'
                      variant='destructive'
                      size='icon'
                      className='absolute top-2 right-2'
                      onClick={() => removeStory(index)}
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>

                    <div className='space-y-2'>
                      <Label htmlFor={`stories.${index}.heading`}>
                        Heading
                      </Label>
                      <Input
                        id={`stories.${index}.heading`}
                        {...register(`stories.${index}.heading`)}
                      />
                      {errors.stories?.[index]?.heading && (
                        <p className='text-sm text-red-500'>
                          {errors.stories?.[index]?.heading?.message}
                        </p>
                      )}
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor={`stories.${index}.content`}>
                        Content
                      </Label>
                      <Textarea
                        id={`stories.${index}.content`}
                        {...register(`stories.${index}.content`)}
                        rows={4}
                      />
                      {errors.stories?.[index]?.content && (
                        <p className='text-sm text-red-500'>
                          {errors.stories?.[index]?.content?.message}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                <Button
                  type='button'
                  variant='outline'
                  onClick={() =>
                    appendStory({
                      heading: "",
                      content: "",
                    })
                  }
                  className='w-full'
                >
                  <PlusCircle className='mr-2 h-4 w-4' />
                  Add Company Story
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className='mt-6 flex justify-end'>
          <Button
            type='submit'
            disabled={updateCompanyMutation.isPending}
            className='w-full md:w-auto'
          >
            {updateCompanyMutation.isPending ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Saving...
              </>
            ) : (
              <>
                <Save className='mr-2 h-4 w-4' />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
