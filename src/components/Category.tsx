import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import categoryImg from "../assets/fruit.png";
import { useGetCategoriesQuery } from "@/redux/api/categoryApi";
import { Skeleton } from "@/components/ui/skeleton";

const TRACK =
    "flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 " +
    "sm:gap-4 md:grid md:grid-cols-6 md:gap-6 md:overflow-visible md:pb-0 " +
    "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
const ITEM = "w-[36%] shrink-0 snap-start sm:w-[26%] md:w-auto";

const Category: React.FC = () => {
    const navigate = useNavigate();
    const { data: categoriesData, isLoading } = useGetCategoriesQuery();
    const categories = categoriesData?.data?.categories || [];

    return (
        <section className="mx-auto max-w-[1440px] px-4 py-8 sm:px-5 md:py-10">
            <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                    <p className="text-caption font-semibold uppercase tracking-wide text-brand-ink">Browse</p>
                    <h2 className="mt-1 text-title font-semibold text-ink">Shop by category</h2>
                </div>
                <Link
                    to="/products"
                    className="flex shrink-0 items-center gap-1 text-meta font-medium text-brand-ink outline-none hover:underline focus-visible:ring-2 focus-visible:ring-brand"
                >
                    View all
                    <ArrowRight size={16} aria-hidden="true" />
                </Link>
            </div>

            <div className={TRACK}>
                {isLoading
                    ? [...Array(6)].map((_, i) => (
                          <div key={i} className={ITEM}>
                              <div className="overflow-hidden rounded-card border border-line-strong bg-surface">
                                  <Skeleton className="aspect-square w-full rounded-none" />
                                  <div className="p-2.5">
                                      <Skeleton className="mx-auto h-4 w-2/3" />
                                  </div>
                              </div>
                          </div>
                      ))
                    : categories.slice(0, 6).map((categ) => (
                          <button
                              key={categ._id}
                              type="button"
                              onClick={() => navigate(`/products?category=${categ.slug}`)}
                              className={`${ITEM} flex flex-col overflow-hidden rounded-card border border-line-strong bg-surface text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand md:hover:border-line-input`}
                          >
                              <div className="aspect-square w-full overflow-hidden bg-surface-sunken">
                                  <img
                                      src={categ.image || categoryImg}
                                      alt=""
                                      className="h-full w-full object-cover"
                                  />
                              </div>
                              <div className="p-2.5 text-center">
                                  <h3 className="truncate text-fine font-semibold text-ink sm:text-meta">
                                      {categ.name}
                                  </h3>
                              </div>
                          </button>
                      ))}
            </div>
        </section>
    );
};

export default Category;
