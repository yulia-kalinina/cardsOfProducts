"use client";

import { useState, useRef, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/lib/redux/hooks";
import { Cat, addCat } from "@/lib/redux/catsSlice";
import Image from "next/image";
import { UiButton } from "@/components/uikit/ui-button";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface FormCat {
  breeds: [
    {
      name: string;
      weight: { imperial: string; metric: string };
      life_span: string;
      temperament: string;
      description: string;
      origin: string;
    }
  ];
  width: number;
  height: number;
}

export default function AddCatForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormCat>({
    breeds: [
      {
        name: "",
        weight: { imperial: "", metric: "" },
        life_span: "",
        temperament: "",
        description: "",
        origin: "",
      },
    ],
    width: 0,
    height: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name.includes("breeds[0].")) {
      const fieldName = name.replace("breeds[0].", "");
      if (fieldName.includes("weight.")) {
        const weightField = fieldName.replace("weight.", "");
        setFormData((prev) => ({
          ...prev,
          breeds: [
            {
              ...prev.breeds[0],
              weight: {
                ...prev.breeds[0].weight,
                [weightField]: value,
              },
            },
          ],
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          breeds: [
            {
              ...prev.breeds[0],
              [fieldName]: value,
            },
          ],
        }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        image: `Invalid file format. Allowed: ${ALLOWED_FILE_TYPES.join(", ")}`,
      }));
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrors((prev) => ({
        ...prev,
        image: `The file is too large. Maximum size: ${
          MAX_FILE_SIZE / 1024 / 1024
        }MB`,
      }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
      setErrors((prev) => ({ ...prev, image: "" }));
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.breeds[0].name.trim()) {
      newErrors.name = "Breed name is required";
    }

    if (!formData.breeds[0].weight.imperial.trim()) {
      newErrors.weightImperial = "Weight (imperial) is required";
    }

    if (!formData.breeds[0].weight.metric.trim()) {
      newErrors.weightImperial = "Weight (metric) is required";
    }

    if (!formData.breeds[0].life_span.trim()) {
      newErrors.weightImperial = "Life span is required";
    }

    if (!formData.breeds[0].temperament.trim()) {
      newErrors.temperament = "Temperament is required";
    }

    if (!formData.breeds[0].origin.trim()) {
      newErrors.origin = "Origin is required";
    }

    if (!formData.breeds[0].description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!previewImage) {
      newErrors.image = "Image is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const mockImageUrl = previewImage || "";

      const newCat: Cat = {
        id: Math.random().toString(36).substring(2, 9),
        url: mockImageUrl,
        width: 500,
        height: 500,
        isFavorite: false,
        breeds: [
          {
            id: Math.random().toString(36).substring(2, 9),
            ...formData.breeds[0],
          },
        ],
      };

      dispatch(addCat(newCat));
      router.push("/products");
    } catch (error) {
      alert(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-[15px]">
      <div className="mt-20">
        <h1 className="text-4xl pt-2 max-w-1/2">Add new cat</h1>

        <form onSubmit={handleSubmit} className="space-y-4 mt-10">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cat Image <span className="text-red-700">*</span>
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept={ALLOWED_FILE_TYPES.join(",")}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="h-32 w-32 bg-gray-200 hover:bg-sky-200 rounded-md flex items-center justify-center"
              >
                {previewImage ? (
                  <Image
                    src={previewImage}
                    alt="Preview"
                    width={128}
                    height={128}
                    className="h-full w-full object-cover"
                    priority
                  />
                ) : (
                  <p className="text-gray-500">Choose image</p>
                )}
              </button>
            </div>
            {errors.image && (
              <p className="mt-1 text-sm text-red-600">{errors.image}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="breeds[0].name"
              className="block text-sm font-medium text-gray-700"
            >
              Breed Name <span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              id="breeds[0].name"
              name="breeds[0].name"
              value={formData.breeds[0].name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500
              focus:ring-indigo-500 p-2 border"
              required
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="breeds[0].weight.imperial"
                className="block text-sm font-medium text-gray-700"
              >
                Weight (Imperial) <span className="text-red-700">*</span>
              </label>
              <input
                type="text"
                id="breeds[0].weight.imperial"
                name="breeds[0].weight.imperial"
                value={formData.breeds[0].weight.imperial}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500
                focus:ring-indigo-500 p-2 border"
                required
              />
              {errors.weightImperial && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.weightImperial}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="breeds[0].weight.metric"
                className="block text-sm font-medium text-gray-700"
              >
                Weight (Metric) <span className="text-red-700">*</span>
              </label>
              <input
                type="text"
                id="breeds[0].weight.metric"
                name="breeds[0].weight.metric"
                value={formData.breeds[0].weight.metric}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                required
              />
              {errors.weightMetric && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.weightMetric}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="breeds[0].life_span"
              className="block text-sm font-medium text-gray-700"
            >
              Life Span <span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              id="breeds[0].life_span"
              name="breeds[0].life_span"
              value={formData.breeds[0].life_span}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500
              focus:ring-indigo-500 p-2 border"
              required
            />
            {errors.life_span && (
              <p className="mt-1 text-sm text-red-600">{errors.life_span}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="breeds[0].temperament"
              className="block text-sm font-medium text-gray-700"
            >
              Temperament <span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              id="breeds[0].temperament"
              name="breeds[0].temperament"
              value={formData.breeds[0].temperament}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500
              focus:ring-indigo-500 p-2 border"
              required
            />
            {errors.temperament && (
              <p className="mt-1 text-sm text-red-600">{errors.temperament}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="breeds[0].origin"
              className="block text-sm font-medium text-gray-700"
            >
              Origin <span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              id="breeds[0].origin"
              name="breeds[0].origin"
              value={formData.breeds[0].origin}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 
              focus:ring-indigo-500 p-2 border"
              required
            />
            {errors.origin && (
              <p className="mt-1 text-sm text-red-600">{errors.origin}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="breeds[0].description"
              className="block text-sm font-medium text-gray-700"
            >
              Description <span className="text-red-700">*</span>
            </label>
            <textarea
              id="breeds[0].description"
              name="breeds[0].description"
              value={formData.breeds[0].description}
              onChange={handleChange}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 
              focus:ring-indigo-500 p-2 border"
              required
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          <div className="flex justify-end space-x-4 pt-4 pb-20">
            <UiButton
              variant="outline"
              type="button"
              className="px-4 py-2 rounded-md"
              onClick={() => router.push("/")}
            >
              Cancel
            </UiButton>
            <UiButton
              variant="primary"
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-md disabled:opacity-50"
            >
              {isSubmitting ? "Adding..." : "Add your cat"}
            </UiButton>
          </div>
        </form>
      </div>
    </div>
  );
}
