import parse, { DOMNode, Element } from 'html-react-parser';
import Image from 'next/image';
import React from 'react';

export default function RichTextRenderer({ content }: { content: string }) {
    return (
        <div className="prose prose-lg max-w-none prose-headings:font-heading prose-a:text-blue-600">
            {parse(content, {
                replace: (domNode: DOMNode) => {
                    if (domNode instanceof Element && domNode.name === 'img') {
                        const { src, alt, width, height } = domNode.attribs;

                        const imgWidth = width ? parseInt(width) : 800;
                        const imgHeight = height ? parseInt(height) : 500;

                        return (
                            <div className="relative w-full my-6 flex justify-center">
                                <Image
                                    src={src || ''}
                                    alt={alt || 'Blog Görseli'}
                                    width={imgWidth}
                                    height={imgHeight}
                                    style={{ width: '100%', height: 'auto', borderRadius: '0.5rem' }}
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                                />
                            </div>
                        );
                    }
                }
            })}
        </div>
    );
}
