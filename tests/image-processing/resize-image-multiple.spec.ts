import resizeImageMultiple from '../../src/image-processing/resize-image-multiple';
import ensureResizeImage from '../../src/image-processing/ensure-resize-image';
import { join } from 'path';

jest.mock('../../src/image-processing/ensure-resize-image');

describe('resizeImageMultiple', () => {

    beforeEach(() => {
        (ensureResizeImage as jest.Mock).mockReset();
    })

    it('requires input file', async () => {
        await expect(resizeImageMultiple('', '/out/dir', {
            widths: [100, 200],
            quality: 75,
            filenameGenerator: ({ width, quality }) => `${width}.${quality}.jpg`,
        })).rejects.toThrow();

        expect(ensureResizeImage).not.toHaveBeenCalled();
    });

    it('requires output dir', async () => {
        await expect(resizeImageMultiple('/in/file', '', {
            widths: [100, 200],
            quality: 75,
            filenameGenerator: ({ width, quality }) => `${width}.${quality}.jpg`,
        })).rejects.toThrow();

        expect(ensureResizeImage).not.toHaveBeenCalled();
    });

    it('doesn\'t generate without widths', async () => {
        expect(await resizeImageMultiple('/in/file', '/out/dir', {
            widths: [],
            quality: 75,
            filenameGenerator: ({ width, quality }) => `${width}.${quality}.jpg`,
        })).toEqual([]);

        expect(ensureResizeImage).not.toHaveBeenCalled();
    });

    it('requires filename generator to return filenames', async () => {
        await expect(resizeImageMultiple('/in/file', '/out/dir', {
            widths: [100, 200],
            quality: 75,
            filenameGenerator: ({ width, quality }) => null,
        })).rejects.toThrow();

        expect(ensureResizeImage).not.toHaveBeenCalled();
    });

    it('generates filenames and resizes', async () => {
        (ensureResizeImage as jest.Mock).mockReturnValueOnce({
            path: '/out/dir/100.75.jpg',
            width: 100,
            height: 50,
        }).mockReturnValueOnce({
            path: '/out/dir/200.75.jpg',
            width: 200,
            height: 100,
        });

        expect(await resizeImageMultiple('/in/file', '/out/dir', {
            widths: [100, 200],
            quality: 75,
            filenameGenerator: ({ width, quality }) => `${width}.${quality}.jpg`,
        })).toEqual([
            {
                path: '/out/dir/100.75.jpg',
                width: 100,
                height: 50,
            },
            {
                path: '/out/dir/200.75.jpg',
                width: 200,
                height: 100,
            },
        ]);

        expect(ensureResizeImage).toHaveBeenCalledTimes(2);
        expect(ensureResizeImage).toHaveBeenCalledWith('/in/file', join('/out/dir', '100.75.jpg'), { width: 100, quality: 75 });
        expect(ensureResizeImage).toHaveBeenCalledWith('/in/file', join('/out/dir', '200.75.jpg'), { width: 200, quality: 75 });
    });

});