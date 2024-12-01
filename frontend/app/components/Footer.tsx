import React from "react";

export default function Footer() {
    return (
        <div className="row-start-3 flex flex-col gap-2 items-center justify-center">
            <span className="flex items-center gap-2">
                内容由AI生成，请注意甄别。
            </span>
            <span className="flex items-center gap-2">
                Designed by <a className="hover:underline hover:underline-offset-4" href="https://github.com/CaptainHPY">CaptainHPY</a>
            </span>
        </div>
    )
}
